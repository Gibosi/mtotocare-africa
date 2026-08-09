package com.mtotocare.africa.diagnosis;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Diagnosis endpoints used by the mobile app.
 * Path: /diagnoses/*
 */
@RestController
@RequestMapping("/diagnoses")
@RequiredArgsConstructor
public class DiagnosisController {

    private final DiagnosisService service;

    @GetMapping("/child/{childId}")
    public ApiResponse<List<DiagnosisDto>> getForChild(@PathVariable Long childId) {
        return ApiResponse.success(service.getForChild(childId));
    }

    @PostMapping("/child/{childId}")
    public ApiResponse<DiagnosisDto> add(@PathVariable Long childId, @RequestBody DiagnosisDto dto) {
        return ApiResponse.success("Diagnosis added", service.add(childId, dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<DiagnosisDto> update(@PathVariable Long id, @RequestBody DiagnosisDto dto) {
        return ApiResponse.success("Diagnosis updated", service.update(id, dto));
    }
}
