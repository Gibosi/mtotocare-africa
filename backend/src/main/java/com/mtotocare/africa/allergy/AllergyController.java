package com.mtotocare.africa.allergy;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Allergy endpoints used by the mobile app.
 * Path: /allergies/*
 */
@RestController
@RequestMapping("/allergies")
@RequiredArgsConstructor
public class AllergyController {

    private final AllergyService service;

    @GetMapping("/child/{childId}")
    public ApiResponse<List<AllergyDto>> getForChild(@PathVariable Long childId) {
        return ApiResponse.success(service.getForChild(childId));
    }

    @GetMapping("/child/{childId}/critical")
    public ApiResponse<List<AllergyDto>> getCritical(@PathVariable Long childId) {
        return ApiResponse.success(service.getCritical(childId));
    }

    @PostMapping("/child/{childId}")
    public ApiResponse<AllergyDto> add(@PathVariable Long childId, @RequestBody AllergyRequest request) {
        return ApiResponse.success("Allergy added", service.add(childId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<AllergyDto> update(@PathVariable Long id, @RequestBody AllergyRequest request) {
        return ApiResponse.success("Allergy updated", service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Allergy deleted", null);
    }
}
