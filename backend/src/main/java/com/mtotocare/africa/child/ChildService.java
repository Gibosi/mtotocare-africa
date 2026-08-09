package com.mtotocare.africa.child;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
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
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final VaccinationRepository vaccinationRepository;
    private final VaccinationScheduleRepository scheduleRepository;

    @Transactional
    public ChildDto addChild(ChildCreateRequest request) {
        User parent = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));

        Child child = Child.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .birthWeightKg(request.getBirthWeightKg())
                .birthHeightCm(request.getBirthHeightCm())
                .parent(parent)
                .build();
        child = childRepository.save(child);
        log.info("Child added: {} for parent: {}", child.getFullName(), parent.getEmail());

        // Auto-generate vaccination schedule
        generateScheduleForChild(child);
        return ChildDto.from(child);
    }

    @Transactional(readOnly = true)
    public List<ChildDto> getChildrenForParent() {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        // Admins and clinical staff see every child ("Patients" management) —
        // everyone else (parents) only see their own.
        if (SecurityUtils.hasAnyRole("ADMIN", "DOCTOR", "NURSE", "MIDWIFE", "CHW")) {
            return childRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()
                    .stream().map(ChildDto::from).collect(Collectors.toList());
        }
        return childRepository.findByParentIdAndDeletedAtIsNull(user.getId())
                .stream().map(ChildDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChildDto getChild(Long id) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        verifyOwnership(child);
        return ChildDto.from(child);
    }

    @Transactional
    public ChildDto updateChild(Long id, ChildRequest request) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        verifyOwnership(child);
        if (request.getFirstName() != null) child.setFirstName(request.getFirstName());
        if (request.getLastName() != null) child.setLastName(request.getLastName());
        if (request.getDateOfBirth() != null) child.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) child.setGender(request.getGender());
        if (request.getBloodGroup() != null) child.setBloodGroup(request.getBloodGroup());
        if (request.getBirthWeightKg() != null) child.setBirthWeightKg(request.getBirthWeightKg());
        if (request.getBirthHeightCm() != null) child.setBirthHeightCm(request.getBirthHeightCm());
        return ChildDto.from(childRepository.save(child));
    }

    @Transactional
    public void deleteChild(Long id) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        verifyOwnership(child);
        child.softDelete();
        childRepository.save(child);
        log.info("Child soft-deleted: {}", child.getId());
    }

    private void verifyOwnership(Child child) {
        User parent = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        boolean isStaff = parent.isHealthcareProvider() || SecurityUtils.hasAnyRole("ADMIN");
        if (!child.getParent().getId().equals(parent.getId()) && !isStaff) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
    }

    @Transactional
    public void generateScheduleForChild(Child child) {
        List<VaccinationSchedule> schedules = scheduleRepository.findAll();
        LocalDate dob = child.getDateOfBirth();
        LocalDate today = LocalDate.now();
        int childAgeMonths = (int) ChronoUnit.MONTHS.between(dob, today);
        int created = 0;

        for (VaccinationSchedule schedule : schedules) {
            // Only create records for vaccines appropriate to the child's current age range
            // (skip if schedule is for an age much older than the child is now).
            // Recommended ages in weeks -> months. We add 12 months of grace.
            int scheduleAgeMonths = (int) Math.ceil(schedule.getRecommendedAgeWeeks() / 4.345);
            if (scheduleAgeMonths > childAgeMonths + 12) {
                // Schedule is for an age more than 1 year older than the child — wait until then
                continue;
            }

            LocalDate dueDate = dob.plusWeeks(schedule.getRecommendedAgeWeeks());
            int doseNumber = schedule.getDoseNumber() != null ? schedule.getDoseNumber() : 1;

            // Use OVERDUE if past, PENDING if upcoming
            String status = dueDate.isBefore(today) ? "OVERDUE" : "PENDING";

            Vaccination v = Vaccination.builder()
                    .child(child)
                    .schedule(schedule)
                    .vaccineCode(schedule.getVaccineCode())
                    .vaccineName(schedule.getVaccineName())
                    .doseNumber(doseNumber)
                    .scheduledDate(dueDate)
                    .nextDoseDue(dueDate)
                    .status(status)
                    .build();
            vaccinationRepository.save(v);
            created++;
        }
        log.info("Generated {} vaccinations for child: {} (skipped {} not yet due)",
                created, child.getId(), schedules.size() - created);
    }
}
