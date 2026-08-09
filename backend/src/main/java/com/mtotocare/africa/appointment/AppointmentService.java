package com.mtotocare.africa.appointment;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.doctor.Doctor;
import com.mtotocare.africa.doctor.DoctorRepository;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final Set<String> VALID_STATUSES = Set.of(
        "SCHEDULED", "CONFIRMED", "RESCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"
    );

    private final AppointmentRepository appointmentRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public Appointment book(AppointmentRequest request) {
        User parent = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        if (!child.getParent().getId().equals(parent.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
        if (request.getAppointmentDatetime().isBefore(LocalDateTime.now())) {
            throw new ApiException("Appointment must be in the future", HttpStatus.BAD_REQUEST, "INVALID_DATETIME");
        }

        Doctor doctor = null;
        if (request.getDoctorId() != null) {
            doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND, "DOCTOR_NOT_FOUND"));
        }

        Appointment appointment = Appointment.builder()
                .child(child)
                .doctor(doctor)
                .appointmentDatetime(request.getAppointmentDatetime())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 30)
                .appointmentType(request.getAppointmentType())
                .clinicName(request.getClinicName())
                .clinicAddress(request.getClinicAddress())
                .doctorName(doctor != null && doctor.getUser() != null
                        ? doctor.getUser().getFullName()
                        : request.getDoctorName())
                .reason(request.getReason())
                .notes(request.getNotes())
                .status("SCHEDULED")
                .build();
        log.info("Appointment booked: child={}, doctor={}, datetime={}",
                child.getId(), doctor != null ? doctor.getId() : "any", request.getAppointmentDatetime());
        return appointmentRepository.save(appointment);
    }

    /**
     * System/clinician-initiated follow-up scheduling — used by the WHO
     * growth assessment to auto-book a follow-up visit for a HIGH or
     * CRITICAL risk child. Unlike book(), this does NOT require the
     * current user to be the child's parent, since it's triggered by
     * clinical logic, not a parent's own booking action.
     */
    @Transactional
    public Appointment scheduleFollowUp(Child child, LocalDateTime when, String appointmentType, String reason) {
        Appointment appointment = Appointment.builder()
                .child(child)
                .appointmentDatetime(when)
                .durationMinutes(30)
                .appointmentType(appointmentType)
                .reason(reason)
                .status("SCHEDULED")
                .build();
        Appointment saved = appointmentRepository.save(appointment);
        log.info("Follow-up auto-scheduled: child={}, datetime={}, reason={}", child.getId(), when, reason);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Appointment> getMyAppointments() {
        User parent = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        return childRepository.findByParentIdAndDeletedAtIsNull(parent.getId())
                .stream()
                .flatMap(child -> appointmentRepository.findByChildIdOrderByAppointmentDatetimeAsc(child.getId()).stream())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Appointment> getUpcoming() {
        return getMyAppointments().stream()
                .filter(a -> a.getAppointmentDatetime().isAfter(LocalDateTime.now()))
                .filter(a -> "SCHEDULED".equals(a.getStatus()) || "CONFIRMED".equals(a.getStatus()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Appointment> getByChild(Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        verifyOwnership(child);
        return appointmentRepository.findByChildIdOrderByAppointmentDatetimeAsc(childId);
    }

    @Transactional
    public Appointment confirm(Long id) {
        Appointment a = getAndVerify(id);
        validateStatusTransition(a.getStatus(), "CONFIRMED");
        a.setStatus("CONFIRMED");
        log.info("Appointment confirmed: id={}", id);
        return appointmentRepository.save(a);
    }

    @Transactional
    public Appointment reschedule(Long id, LocalDateTime newDatetime, String reason) {
        Appointment a = getAndVerify(id);
        if (newDatetime.isBefore(LocalDateTime.now())) {
            throw new ApiException("New datetime must be in the future", HttpStatus.BAD_REQUEST, "INVALID_DATETIME");
        }
        a.setAppointmentDatetime(newDatetime);
        a.setStatus("RESCHEDULED");
        a.setNotes((a.getNotes() != null ? a.getNotes() + "\n" : "") +
                  "Rescheduled on " + LocalDateTime.now() + ": " + reason);
        log.info("Appointment rescheduled: id={}, new={}", id, newDatetime);
        return appointmentRepository.save(a);
    }

    @Transactional
    public Appointment cancel(Long id, String reason) {
        Appointment a = getAndVerify(id);
        a.setStatus("CANCELLED");
        a.setCancellationReason(reason != null ? reason : "Cancelled by user");
        log.info("Appointment cancelled: id={}, reason={}", id, reason);
        return appointmentRepository.save(a);
    }

    @Transactional
    public Appointment markCompleted(Long id, String notes) {
        Appointment a = getAndVerify(id);
        validateStatusTransition(a.getStatus(), "COMPLETED");
        a.setStatus("COMPLETED");
        if (notes != null) a.setNotes(notes);
        log.info("Appointment completed: id={}", id);
        return appointmentRepository.save(a);
    }

    @Transactional
    public Appointment markNoShow(Long id) {
        Appointment a = getAndVerify(id);
        a.setStatus("NO_SHOW");
        return appointmentRepository.save(a);
    }

    @Transactional
    public Appointment startAppointment(Long id) {
        Appointment a = getAndVerify(id);
        a.setStatus("IN_PROGRESS");
        return appointmentRepository.save(a);
    }

    private Appointment getAndVerify(Long id) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new ApiException("Appointment not found", HttpStatus.NOT_FOUND, "APPOINTMENT_NOT_FOUND"));
        verifyOwnership(a);
        return a;
    }

    @Transactional(readOnly = true)
    public Appointment getById(Long id) {
        return getAndVerify(id);
    }

    private void verifyOwnership(Appointment a) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        if (!a.getChild().getParent().getId().equals(user.getId()) && !user.isHealthcareProvider()) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
    }

    private void verifyOwnership(Child child) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        if (!child.getParent().getId().equals(user.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
    }

    private void validateStatusTransition(String from, String to) {
        if (!VALID_STATUSES.contains(to)) {
            throw new ApiException("Invalid status: " + to, HttpStatus.BAD_REQUEST, "INVALID_STATUS");
        }
        if ("COMPLETED".equals(from) || "CANCELLED".equals(from) || "NO_SHOW".equals(from)) {
            throw new ApiException("Cannot transition from " + from + " to " + to, HttpStatus.BAD_REQUEST, "INVALID_TRANSITION");
        }
    }
}
