package com.mtotocare.africa.sync;

import com.mtotocare.africa.appointment.Appointment;
import com.mtotocare.africa.appointment.AppointmentRepository;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.child.ChildService;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.growth.GrowthRecord;
import com.mtotocare.africa.growth.GrowthRepository;
import com.mtotocare.africa.medical.HealthRecord;
import com.mtotocare.africa.medical.HealthRecordRepository;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import com.mtotocare.africa.vaccination.Vaccination;
import com.mtotocare.africa.vaccination.VaccinationRepository;
import com.mtotocare.africa.vaccination.VaccinationSchedule;
import com.mtotocare.africa.vaccination.VaccinationScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {

    private final SyncLogRepository syncLogRepository;
    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final VaccinationRepository vaccinationRepository;
    private final VaccinationScheduleRepository scheduleRepository;
    private final GrowthRepository growthRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final ChildService childService;

    public Map<String, Object> getSyncInfo() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        LocalDateTime lastSync = syncLogRepository.findLastSyncTime(user.getId());
        Map<String, Object> info = new HashMap<>();
        info.put("userId", user.getId());
        info.put("lastSyncTime", lastSync != null ? lastSync.toString() : "never");
        info.put("serverTime", LocalDateTime.now().toString());
        return info;
    }

    @Transactional
    public SyncBatchResponse processBatchSync(SyncBatchRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        String syncId = "sync-" + UUID.randomUUID().toString().substring(0, 8);
        log.info("[{}] Processing batch sync for user {} ({} operations)",
                syncId, email, request.getOperations() != null ? request.getOperations().size() : 0);

        List<OperationResult> results = new ArrayList<>();
        int totalUploaded = 0;
        int conflicts = 0;

        if (request.getOperations() != null) {
            for (SyncOperation op : request.getOperations()) {
                OperationResult result = processSingleOperation(user, op);
                results.add(result);
                if ("SUCCESS".equals(result.getStatus())) totalUploaded++;
                if ("CONFLICT".equals(result.getStatus())) conflicts++;
            }
        }

        DeltaData delta = computeDelta(user, request.getLastSyncTime());

        syncLogRepository.save(SyncLog.builder()
                .userId(user.getId())
                .deviceId(request.getDeviceId())
                .clientId(request.getClientId())
                .operation("BOTH")
                .recordsUploaded(totalUploaded)
                .recordsDownloaded(countDeltaRecords(delta))
                .conflictsResolved(conflicts)
                .syncedAt(LocalDateTime.now())
                .clientTimestamp(request.getClientTimestamp())
                .appVersion(request.getAppVersion())
                .build());

        return SyncBatchResponse.builder()
                .syncId(syncId)
                .serverTimestamp(LocalDateTime.now())
                .results(results)
                .totalUploaded(totalUploaded)
                .totalDownloaded(countDeltaRecords(delta))
                .conflictsResolved(conflicts)
                .delta(delta)
                .build();
    }

    private OperationResult processSingleOperation(User user, SyncOperation op) {
        try {
            String entityType = op.getEntityType();
            String operationType = op.getOperationType();
            Map<String, Object> payload = op.getPayload();

            if (entityType == null) {
                return OperationResult.builder()
                        .clientOperationId(op.getClientOperationId())
                        .status("FAILED")
                        .errorMessage("Missing entityType")
                        .build();
            }

            return switch (entityType) {
                case "children" -> handleChildOp(user, operationType, op, payload);
                case "growth_records" -> handleGrowthOp(user, operationType, op, payload);
                case "appointments" -> handleAppointmentOp(user, operationType, op, payload);
                case "health_records" -> handleHealthRecordOp(user, operationType, op, payload);
                default -> OperationResult.builder()
                        .clientOperationId(op.getClientOperationId())
                        .status("FAILED")
                        .errorMessage("Unknown entity type: " + entityType)
                        .build();
            };
        } catch (Exception e) {
            log.error("Sync op failed: {} - {}", op.getClientOperationId(), e.getMessage());
            return OperationResult.builder()
                    .clientOperationId(op.getClientOperationId())
                    .status("FAILED")
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    private OperationResult handleChildOp(User user, String op, SyncOperation syncOp, Map<String, Object> payload) {
        if ("CREATE".equals(op)) {
            Child child = new Child();
            applyChildPayload(child, payload, user);
            child = childRepository.save(child);
            // Generate vaccination schedule
            childService.generateScheduleForChild(child);
            return OperationResult.builder()
                    .clientOperationId(syncOp.getClientOperationId())
                    .status("SUCCESS")
                    .serverEntityId(child.getId())
                    .build();
        } else if ("UPDATE".equals(op)) {
            Long id = getLong(payload, "id", syncOp.getServerEntityId());
            if (id == null) return OperationResult.builder()
                    .clientOperationId(syncOp.getClientOperationId())
                    .status("FAILED")
                    .errorMessage("Missing id")
                    .build();
            Child child = childRepository.findById(id)
                    .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
            if (!child.getParent().getId().equals(user.getId())) {
                throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
            }
            applyChildPayload(child, payload, user);
            child = childRepository.save(child);
            return OperationResult.builder()
                    .clientOperationId(syncOp.getClientOperationId())
                    .status("SUCCESS")
                    .serverEntityId(child.getId())
                    .build();
        } else if ("DELETE".equals(op)) {
            Long id = getLong(payload, "id", syncOp.getServerEntityId());
            if (id != null) {
                childRepository.findById(id).ifPresent(c -> {
                    c.softDelete();
                    childRepository.save(c);
                });
            }
            return OperationResult.builder()
                    .clientOperationId(syncOp.getClientOperationId())
                    .status("SUCCESS")
                    .serverEntityId(id)
                    .build();
        }
        return OperationResult.builder()
                .clientOperationId(syncOp.getClientOperationId())
                .status("FAILED")
                .errorMessage("Unknown op: " + op)
                .build();
    }

    private void applyChildPayload(Child child, Map<String, Object> payload, User parent) {
        if (payload.containsKey("firstName")) child.setFirstName((String) payload.get("firstName"));
        if (payload.containsKey("lastName")) child.setLastName((String) payload.get("lastName"));
        if (payload.containsKey("dateOfBirth")) {
            String dob = (String) payload.get("dateOfBirth");
            if (dob != null) child.setDateOfBirth(LocalDate.parse(dob));
        }
        if (payload.containsKey("gender")) child.setGender((String) payload.get("gender"));
        if (payload.containsKey("bloodGroup")) child.setBloodGroup((String) payload.get("bloodGroup"));
        if (payload.containsKey("birthWeightKg")) child.setBirthWeightKg(toDouble(payload.get("birthWeightKg")));
        if (payload.containsKey("birthHeightCm")) child.setBirthHeightCm(toDouble(payload.get("birthHeightCm")));
        if (child.getId() == null) child.setParent(parent);
    }

    private OperationResult handleGrowthOp(User user, String op, SyncOperation syncOp, Map<String, Object> payload) {
        if ("CREATE".equals(op)) {
            Long childId = getLong(payload, "childId", null);
            Child child = childRepository.findById(childId)
                    .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
            if (!child.getParent().getId().equals(user.getId())) {
                throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
            }
            GrowthRecord record = new GrowthRecord();
            record.setChild(child);
            if (payload.containsKey("measurementDate")) {
                record.setMeasurementDate(LocalDate.parse((String) payload.get("measurementDate")));
            }
            if (payload.containsKey("weightKg")) record.setWeightKg(toDouble(payload.get("weightKg")));
            if (payload.containsKey("heightCm")) record.setHeightCm(toDouble(payload.get("heightCm")));
            if (payload.containsKey("headCircumferenceCm")) record.setHeadCircumferenceCm(toDouble(payload.get("headCircumferenceCm")));
            if (payload.containsKey("muacCm")) record.setMuacCm(toDouble(payload.get("muacCm")));
            if (payload.containsKey("notes")) record.setNotes((String) payload.get("notes"));
            record.setRecordedBy(user.getEmail());
            record = growthRepository.save(record);
            return OperationResult.builder()
                    .clientOperationId(syncOp.getClientOperationId())
                    .status("SUCCESS")
                    .serverEntityId(record.getId())
                    .build();
        }
        return OperationResult.builder()
                .clientOperationId(syncOp.getClientOperationId())
                .status("FAILED")
                .errorMessage("Unsupported op: " + op)
                .build();
    }

    private OperationResult handleAppointmentOp(User user, String op, SyncOperation syncOp, Map<String, Object> payload) {
        if ("CREATE".equals(op)) {
            Long childId = getLong(payload, "childId", null);
            Child child = childRepository.findById(childId)
                    .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
            if (!child.getParent().getId().equals(user.getId())) {
                throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
            }
            Appointment appt = new Appointment();
            appt.setChild(child);
            if (payload.containsKey("appointmentDatetime")) {
                appt.setAppointmentDatetime(LocalDateTime.parse((String) payload.get("appointmentDatetime")));
            }
            if (payload.containsKey("durationMinutes")) appt.setDurationMinutes(toInt(payload.get("durationMinutes")));
            if (payload.containsKey("appointmentType")) appt.setAppointmentType((String) payload.get("appointmentType"));
            if (payload.containsKey("clinicName")) appt.setClinicName((String) payload.get("clinicName"));
            if (payload.containsKey("clinicAddress")) appt.setClinicAddress((String) payload.get("clinicAddress"));
            if (payload.containsKey("doctorName")) appt.setDoctorName((String) payload.get("doctorName"));
            if (payload.containsKey("reason")) appt.setReason((String) payload.get("reason"));
            appt.setStatus("SCHEDULED");
            appt = appointmentRepository.save(appt);
            return OperationResult.builder()
                    .clientOperationId(syncOp.getClientOperationId())
                    .status("SUCCESS")
                    .serverEntityId(appt.getId())
                    .build();
        } else if ("DELETE".equals(op)) {
            Long id = getLong(payload, "id", syncOp.getServerEntityId());
            if (id != null) {
                appointmentRepository.findById(id).ifPresent(a -> {
                    a.setStatus("CANCELLED");
                    if (payload.containsKey("cancellationReason")) {
                        a.setCancellationReason((String) payload.get("cancellationReason"));
                    }
                    appointmentRepository.save(a);
                });
            }
            return OperationResult.builder()
                    .clientOperationId(syncOp.getClientOperationId())
                    .status("SUCCESS")
                    .serverEntityId(id)
                    .build();
        }
        return OperationResult.builder()
                .clientOperationId(syncOp.getClientOperationId())
                .status("FAILED")
                .errorMessage("Unsupported op: " + op)
                .build();
    }

    private OperationResult handleHealthRecordOp(User user, String op, SyncOperation syncOp, Map<String, Object> payload) {
        if ("CREATE".equals(op)) {
            Long childId = getLong(payload, "childId", null);
            Child child = childRepository.findById(childId)
                    .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
            if (!child.getParent().getId().equals(user.getId())) {
                throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
            }
            HealthRecord record = new HealthRecord();
            record.setChild(child);
            record.setRecordType((String) payload.getOrDefault("recordType", "GENERAL"));
            record.setTitle((String) payload.get("title"));
            record.setDescription((String) payload.get("description"));
            if (payload.containsKey("recordDate")) {
                record.setRecordDate(LocalDate.parse((String) payload.get("recordDate")));
            }
            if (payload.containsKey("doctorName")) record.setDoctorName((String) payload.get("doctorName"));
            if (payload.containsKey("clinicName")) record.setClinicName((String) payload.get("clinicName"));
            if (payload.containsKey("severity")) record.setSeverity((String) payload.get("severity"));
            record = healthRecordRepository.save(record);
            return OperationResult.builder()
                    .clientOperationId(syncOp.getClientOperationId())
                    .status("SUCCESS")
                    .serverEntityId(record.getId())
                    .build();
        }
        return OperationResult.builder()
                .clientOperationId(syncOp.getClientOperationId())
                .status("FAILED")
                .errorMessage("Unsupported op: " + op)
                .build();
    }

    private DeltaData computeDelta(User user, LocalDateTime lastSyncTime) {
        LocalDateTime since = lastSyncTime != null ? lastSyncTime : LocalDateTime.now().minusYears(1);
        List<Long> childIds = childRepository.findByParentIdAndDeletedAtIsNull(user.getId())
                .stream().map(Child::getId).collect(Collectors.toList());

        DeltaData.DeltaDataBuilder builder = DeltaData.builder();

        builder.children(childRepository.findByParentIdAndDeletedAtIsNull(user.getId()));
        builder.vaccinationSchedules(scheduleRepository.findByActiveTrue());

        if (!childIds.isEmpty()) {
            builder.vaccinations(childIds.stream()
                    .flatMap(id -> vaccinationRepository.findByChildIdOrderByNextDoseDueAsc(id).stream())
                    .collect(Collectors.toList()));
            builder.growthRecords(childIds.stream()
                    .flatMap(id -> growthRepository.findByChildIdOrderByMeasurementDateDesc(id).stream())
                    .collect(Collectors.toList()));
            builder.healthRecords(childIds.stream()
                    .flatMap(id -> healthRecordRepository.findByChildIdOrderByRecordDateDesc(id).stream())
                    .collect(Collectors.toList()));
        }
        return builder.build();
    }

    private int countDeltaRecords(DeltaData delta) {
        if (delta == null) return 0;
        int count = 0;
        if (delta.getChildren() != null) count += delta.getChildren().size();
        if (delta.getVaccinations() != null) count += delta.getVaccinations().size();
        if (delta.getGrowthRecords() != null) count += delta.getGrowthRecords().size();
        if (delta.getHealthRecords() != null) count += delta.getHealthRecords().size();
        return count;
    }

    private Long getLong(Map<String, Object> payload, String key, Long defaultValue) {
        if (payload == null) return defaultValue;
        Object val = payload.get(key);
        if (val == null) return defaultValue;
        if (val instanceof Number) return ((Number) val).longValue();
        if (val instanceof String) return Long.parseLong((String) val);
        return defaultValue;
    }

    private Double toDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).doubleValue();
        if (o instanceof String) return Double.parseDouble((String) o);
        return null;
    }

    private Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).intValue();
        if (o instanceof String) return Integer.parseInt((String) o);
        return null;
    }
}
