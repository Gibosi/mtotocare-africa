package com.mtotocare.africa.vaccination;

import com.mtotocare.africa.audit.AuditService;
import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin management of the vaccine schedule CATALOG — the EPI reference
 * list (e.g. "BCG at birth", "OPV at 6 weeks") used to auto-generate each
 * child's individual vaccination records. This is distinct from
 * VaccinationController, which manages a specific child's actual doses.
 */
@RestController
@RequestMapping("/admin/vaccine-schedules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class VaccinationScheduleController {

    private final VaccinationScheduleRepository scheduleRepository;
    private final AuditService auditService;

    @GetMapping
    public ApiResponse<List<VaccinationScheduleDto>> getAll() {
        return ApiResponse.success(scheduleRepository.findAll().stream()
                .map(VaccinationScheduleDto::from)
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ApiResponse<VaccinationScheduleDto> create(@RequestBody VaccinationScheduleDto dto, HttpServletRequest http) {
        if (dto.getVaccineCode() == null || dto.getVaccineCode().isBlank()) {
            throw new ApiException("vaccineCode is required", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        }
        if (dto.getVaccineName() == null || dto.getVaccineName().isBlank()) {
            throw new ApiException("vaccineName is required", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        }
        VaccinationSchedule entity = VaccinationSchedule.builder()
                .vaccineCode(dto.getVaccineCode().toUpperCase())
                .vaccineName(dto.getVaccineName())
                .description(dto.getDescription())
                .recommendedAgeWeeks(dto.getRecommendedAgeWeeks() != null ? dto.getRecommendedAgeWeeks() : 0)
                .dosesRequired(dto.getDosesRequired() != null ? dto.getDosesRequired() : 1)
                .doseNumber(dto.getDoseNumber() != null ? dto.getDoseNumber() : 1)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        VaccinationSchedule saved = scheduleRepository.save(entity);
        auditService.record("CREATE_VACCINE_SCHEDULE", "VaccinationSchedule", saved.getId(),
                "Created " + saved.getVaccineName(), http);
        return ApiResponse.success("Vaccine schedule created", VaccinationScheduleDto.from(saved));
    }

    @PutMapping("/{id}")
    public ApiResponse<VaccinationScheduleDto> update(@PathVariable Long id, @RequestBody VaccinationScheduleDto dto, HttpServletRequest http) {
        VaccinationSchedule s = scheduleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Vaccine schedule not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
        if (dto.getVaccineName() != null) s.setVaccineName(dto.getVaccineName());
        if (dto.getDescription() != null) s.setDescription(dto.getDescription());
        if (dto.getRecommendedAgeWeeks() != null) s.setRecommendedAgeWeeks(dto.getRecommendedAgeWeeks());
        if (dto.getDosesRequired() != null) s.setDosesRequired(dto.getDosesRequired());
        if (dto.getDoseNumber() != null) s.setDoseNumber(dto.getDoseNumber());
        if (dto.getActive() != null) s.setActive(dto.getActive());
        VaccinationSchedule saved = scheduleRepository.save(s);
        auditService.record("UPDATE_VACCINE_SCHEDULE", "VaccinationSchedule", id,
                "Updated " + saved.getVaccineName(), http);
        return ApiResponse.success("Vaccine schedule updated", VaccinationScheduleDto.from(saved));
    }

    @PutMapping("/{id}/deactivate")
    public ApiResponse<VaccinationScheduleDto> deactivate(@PathVariable Long id, HttpServletRequest http) {
        VaccinationSchedule s = scheduleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Vaccine schedule not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
        s.setActive(false);
        VaccinationSchedule saved = scheduleRepository.save(s);
        auditService.record("DEACTIVATE_VACCINE_SCHEDULE", "VaccinationSchedule", id,
                "Deactivated " + saved.getVaccineName(), http);
        return ApiResponse.success("Vaccine schedule deactivated", VaccinationScheduleDto.from(saved));
    }

    @PutMapping("/{id}/activate")
    public ApiResponse<VaccinationScheduleDto> activate(@PathVariable Long id, HttpServletRequest http) {
        VaccinationSchedule s = scheduleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Vaccine schedule not found", HttpStatus.NOT_FOUND, "NOT_FOUND"));
        s.setActive(true);
        VaccinationSchedule saved = scheduleRepository.save(s);
        auditService.record("ACTIVATE_VACCINE_SCHEDULE", "VaccinationSchedule", id,
                "Activated " + saved.getVaccineName(), http);
        return ApiResponse.success("Vaccine schedule activated", VaccinationScheduleDto.from(saved));
    }
}
