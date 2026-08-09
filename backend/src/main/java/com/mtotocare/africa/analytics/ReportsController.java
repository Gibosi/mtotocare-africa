package com.mtotocare.africa.analytics;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Alias controller for /reports/* — same data as /analytics/* but
 * with the path the mobile/web clients expect. Keeps the API
 * backwards-compatible.
 */
@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final AnalyticsService service;

    @GetMapping("/child/{childId}/health-summary")
    public ApiResponse<Map<String, Object>> childHealthSummary(@PathVariable Long childId) {
        return ApiResponse.success(service.getChildSummary(childId));
    }

    @GetMapping("/clinic")
    public ApiResponse<Map<String, Object>> clinicReport() {
        return ApiResponse.success(service.getDashboard());
    }

    @GetMapping("/vaccination-coverage")
    public ApiResponse<List<Map<String, Object>>> vaccinationCoverage() {
        return ApiResponse.success(service.getVaccinationCoverageReport());
    }
}
