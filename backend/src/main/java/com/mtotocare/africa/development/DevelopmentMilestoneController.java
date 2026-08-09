package com.mtotocare.africa.development;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/milestones")
@RequiredArgsConstructor
public class DevelopmentMilestoneController {

    private final DevelopmentMilestoneService service;

    @PostMapping("/child/{childId}/generate")
    public ApiResponse<List<DevelopmentMilestoneDto>> generate(@PathVariable Long childId) {
        return ApiResponse.success("Milestones generated", service.generateForChild(childId));
    }

    @GetMapping("/child/{childId}")
    public ApiResponse<List<DevelopmentMilestoneDto>> list(@PathVariable Long childId) {
        return ApiResponse.success(service.getForChild(childId));
    }

    @GetMapping("/child/{childId}/summary")
    public ApiResponse<DevelopmentSummaryDto> summary(@PathVariable Long childId) {
        return ApiResponse.success(service.getSummary(childId));
    }

    @PostMapping("/{id}/achieve")
    public ApiResponse<DevelopmentMilestoneDto> achieve(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate achievedDate,
            @RequestParam(required = false) String notes) {
        return ApiResponse.success("Milestone achieved", service.markAchieved(id, achievedDate, notes));
    }

    @PostMapping("/{id}/delay")
    public ApiResponse<DevelopmentMilestoneDto> delay(@PathVariable Long id, @RequestParam(required = false) String notes) {
        return ApiResponse.success("Milestone marked delayed", service.markDelayed(id, notes));
    }
}
