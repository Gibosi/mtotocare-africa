package com.mtotocare.africa.pregnancy;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/pregnancies")
@RequiredArgsConstructor
public class PregnancyController {

    private final PregnancyService pregnancyService;

    @PostMapping
    public ApiResponse<PregnancyDto> create(@Valid @RequestBody PregnancyRequest request) {
        return ApiResponse.success("Pregnancy record created", pregnancyService.createPregnancy(request));
    }

    @GetMapping
    public ApiResponse<List<PregnancyDto>> getAll() {
        return ApiResponse.success(pregnancyService.getMyPregnancies());
    }

    @GetMapping("/active")
    public ApiResponse<PregnancyDto> getActive() {
        return ApiResponse.success(pregnancyService.getActivePregnancy());
    }

    @PostMapping("/{id}/delivery")
    public ApiResponse<PregnancyDto> recordDelivery(
            @PathVariable Long id,
            @RequestParam String deliveryType,
            @RequestParam String outcome,
            @RequestParam(required = false) String babyGender,
            @RequestParam(required = false) Double babyWeight) {
        return ApiResponse.success("Delivery recorded", pregnancyService.recordDelivery(id, deliveryType, outcome, babyGender, babyWeight));
    }
}
