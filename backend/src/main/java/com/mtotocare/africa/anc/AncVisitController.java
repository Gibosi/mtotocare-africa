package com.mtotocare.africa.anc;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/anc")
@RequiredArgsConstructor
public class AncVisitController {

    private final AncVisitService ancVisitService;

    @PostMapping("/pregnancy/{pregnancyId}")
    public ApiResponse<AncVisitDto> recordVisit(@PathVariable Long pregnancyId, @Valid @RequestBody AncVisitRequest request) {
        return ApiResponse.success("Visit recorded", ancVisitService.recordVisit(pregnancyId, request));
    }

    @GetMapping("/pregnancy/{pregnancyId}")
    public ApiResponse<List<AncVisitDto>> getAllVisits(@PathVariable Long pregnancyId) {
        return ApiResponse.success(ancVisitService.getVisitsForPregnancy(pregnancyId));
    }

    @GetMapping("/pregnancy/{pregnancyId}/anc")
    public ApiResponse<List<AncVisitDto>> getAncVisits(@PathVariable Long pregnancyId) {
        return ApiResponse.success(ancVisitService.getAncVisits(pregnancyId));
    }

    @GetMapping("/pregnancy/{pregnancyId}/pnc")
    public ApiResponse<List<AncVisitDto>> getPncVisits(@PathVariable Long pregnancyId) {
        return ApiResponse.success(ancVisitService.getPncVisits(pregnancyId));
    }
}
