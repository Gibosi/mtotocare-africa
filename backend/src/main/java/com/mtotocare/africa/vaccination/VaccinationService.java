package com.mtotocare.africa.vaccination;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VaccinationService {

    private final VaccinationRepository vaccinationRepository;
    private final VaccinationScheduleRepository scheduleRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    public List<VaccinationDto> getChildVaccinations(Long childId) {
        return vaccinationRepository.findByChildIdOrderByNextDoseDueAsc(childId).stream()
            .map(v -> VaccinationDto.from(v, v.getSchedule()))
            .collect(Collectors.toList());
    }

    public List<VaccinationSchedule> getActiveSchedules() {
        return scheduleRepository.findByActiveTrueOrderByRecommendedAgeWeeksAsc();
    }

    public List<VaccinationDto> getOverdue() {
        return vaccinationRepository.findOverdueVaccinations(LocalDate.now()).stream()
            .map(v -> VaccinationDto.from(v, v.getSchedule()))
            .collect(Collectors.toList());
    }

    public List<VaccinationDto> getUpcoming(int days) {
        LocalDate today = LocalDate.now();
        LocalDate future = today.plusDays(days);
        return vaccinationRepository.findAll().stream()
            .filter(v -> "PENDING".equals(v.getStatus()))
            .filter(v -> v.getNextDoseDue() != null && !v.getNextDoseDue().isBefore(today) && !v.getNextDoseDue().isAfter(future))
            .map(v -> VaccinationDto.from(v, v.getSchedule()))
            .collect(Collectors.toList());
    }

    @Transactional
    public VaccinationDto recordVaccination(Long childId, RecordVaccinationRequest request) {
        Child child = childRepository.findById(childId)
            .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));

        VaccinationSchedule schedule = scheduleRepository.findById(request.getScheduleId())
            .orElseThrow(() -> new ApiException("Schedule not found", HttpStatus.NOT_FOUND, "SCHEDULE_NOT_FOUND"));

        // Check if already administered
        List<Vaccination> existing = vaccinationRepository.findByChild_IdAndSchedule_Id(childId, request.getScheduleId());
        if (!existing.isEmpty() && existing.stream().anyMatch(v -> "COMPLETED".equals(v.getStatus()))) {
            throw new ApiException("Vaccine already administered", HttpStatus.CONFLICT, "VACCINE_ALREADY_DONE");
        }

        User currentUser = userRepository.findActiveByEmail(
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElse(null);

        Vaccination vaccination = Vaccination.builder()
            .child(child)
            .schedule(schedule)
            .vaccineCode(schedule.getVaccineCode())
            .vaccineName(schedule.getVaccineName())
            .doseNumber(schedule.getDoseNumber())
            .administeredAt(request.getAdministeredAt() != null ? request.getAdministeredAt() : LocalDate.now())
            .nextDoseDue(request.getNextDoseDue())
            .clinicName(request.getClinicName())
            .batchNumber(request.getBatchNumber())
            .notes(request.getNotes())
            .administeredBy(currentUser != null ? currentUser.getFullName() : null)
            .status("COMPLETED")
            .build();

        vaccination = vaccinationRepository.save(vaccination);
        return VaccinationDto.from(vaccination, schedule);
    }

    @Transactional
    public List<VaccinationDto> scheduleAllForChild(Long childId) {
        Child child = childRepository.findById(childId)
            .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));

        List<VaccinationSchedule> schedules = scheduleRepository.findByActiveTrueOrderByRecommendedAgeWeeksAsc();
        return schedules.stream().map(schedule -> {
            List<Vaccination> existing = vaccinationRepository.findByChild_IdAndSchedule_Id(childId, schedule.getId());
            if (!existing.isEmpty()) {
                return VaccinationDto.from(existing.get(0), schedule);
            }
            LocalDate childDob = child.getDateOfBirth();
            LocalDate scheduledDate = childDob != null
                ? childDob.plusWeeks(schedule.getRecommendedAgeWeeks())
                : LocalDate.now().plusWeeks(schedule.getRecommendedAgeWeeks());
            Vaccination v = Vaccination.builder()
                .child(child)
                .schedule(schedule)
                .vaccineCode(schedule.getVaccineCode())
                .vaccineName(schedule.getVaccineName())
                .doseNumber(schedule.getDoseNumber())
                .scheduledDate(scheduledDate)
                .nextDoseDue(scheduledDate)
                .status("PENDING")
                .build();
            return VaccinationDto.from(vaccinationRepository.save(v), schedule);
        }).collect(Collectors.toList());
    }
}
