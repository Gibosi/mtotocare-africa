package com.mtotocare.africa.analytics;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService service;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.success(service.getDashboard());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('DOCTOR','NURSE','MIDWIFE','CHW','ADMIN')")
    @GetMapping("/provider-dashboard")
    public ApiResponse<Map<String, Object>> providerDashboard() {
        return ApiResponse.success(service.getProviderDashboard());
    }

    @GetMapping("/child/{childId}/summary")
    public ApiResponse<Map<String, Object>> childSummary(@PathVariable Long childId) {
        return ApiResponse.success(service.getChildSummary(childId));
    }

    @GetMapping("/vaccination-coverage")
    public ApiResponse<List<Map<String, Object>>> vaccinationCoverage() {
        return ApiResponse.success(service.getVaccinationCoverageReport());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','MIDWIFE','CHW')")
    @GetMapping("/population")
    public ApiResponse<Map<String, Object>> population() {
        return ApiResponse.success(service.getPopulationStats());
    }
}
