package com.mtotocare.africa.vaccination;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vaccinations")
@RequiredArgsConstructor
public class VaccinationController {

    private final VaccinationService vaccinationService;

    @GetMapping("/schedules")
    public ApiResponse<List<VaccinationSchedule>> getSchedules() {
        return ApiResponse.success(vaccinationService.getActiveSchedules());
    }

    @GetMapping("/schedules/active")
    public ApiResponse<List<VaccinationSchedule>> getActiveSchedules() {
        return ApiResponse.success(vaccinationService.getActiveSchedules());
    }

    @GetMapping("/child/{childId}")
    public ApiResponse<List<VaccinationDto>> getChildVaccinations(@PathVariable Long childId) {
        return ApiResponse.success(vaccinationService.getChildVaccinations(childId));
    }

    @GetMapping("/overdue")
    public ApiResponse<List<VaccinationDto>> getOverdue() {
        return ApiResponse.success(vaccinationService.getOverdue());
    }

    /**
     * Vaccines due in the next N days (default 30). Used by the parent home
     * screen and provider dashboards to surface "coming up" reminders.
     * This was previously missing — the mobile app and web frontend both
     * called it already, but it 404'd because it had never been wired up.
     */
    @GetMapping("/upcoming")
    public ApiResponse<List<VaccinationDto>> getUpcoming(@RequestParam(defaultValue = "30") int days) {
        return ApiResponse.success(vaccinationService.getUpcoming(days));
    }

    /**
     * Record that a scheduled dose was administered — marks the matching
     * PENDING/OVERDUE record COMPLETED. This is the core "mark as given"
     * action healthcare workers and doctors need; it existed in
     * VaccinationService already but was never exposed on any endpoint, so
     * vaccination status could never actually be updated from the app.
     * Restricted to clinical roles (plus admin) — parents can view but not
     * record administration themselves.
     */
    @PreAuthorize("hasAnyRole('DOCTOR','NURSE','MIDWIFE','CHW','ADMIN')")
    @PostMapping("/child/{childId}")
    public ApiResponse<VaccinationDto> recordVaccination(@PathVariable Long childId,
                                                          @RequestBody RecordVaccinationRequest request) {
        return ApiResponse.success("Vaccination recorded", vaccinationService.recordVaccination(childId, request));
    }

    /**
     * (Re)generate the full EPI vaccination schedule for a child — used if a
     * child's schedule wasn't created at signup time or needs refreshing
     * after an active schedule changes. Idempotent: existing records for a
     * schedule item are left as-is rather than duplicated.
     */
    @PreAuthorize("hasAnyRole('DOCTOR','NURSE','MIDWIFE','CHW','ADMIN')")
    @PostMapping("/child/{childId}/schedule")
    public ApiResponse<List<VaccinationDto>> scheduleAllForChild(@PathVariable Long childId) {
        return ApiResponse.success("Vaccination schedule generated", vaccinationService.scheduleAllForChild(childId));
    }
}
