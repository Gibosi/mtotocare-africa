package com.mtotocare.africa.medication;

import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;
    private final UserRepository userRepository;

    @GetMapping("/child/{childId}")
    public ApiResponse<List<MedicationDto>> getForChild(@PathVariable Long childId) {
        return ApiResponse.success(medicationService.getForChild(childId));
    }

    @GetMapping("/child/{childId}/active")
    public ApiResponse<List<MedicationDto>> getActive(@PathVariable Long childId) {
        return ApiResponse.success(medicationService.getActive(childId));
    }

    @PostMapping("/child/{childId}")
    public ApiResponse<MedicationDto> add(@PathVariable Long childId, @RequestBody MedicationRequest request) {
        // Force resolve current user from auth context to ensure provider is set
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            userRepository.findActiveByEmail(email).ifPresent(u -> {
                if (request.getPrescribedBy() == null) {
                    request.setPrescribedBy(u.getFullName());
                }
            });
        } catch (Exception ignored) {}
        return ApiResponse.success("Medication added", medicationService.add(childId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<MedicationDto> update(@PathVariable Long id, @RequestBody MedicationRequest request) {
        return ApiResponse.success("Medication updated", medicationService.update(id, request));
    }

    @PutMapping("/{id}/discontinue")
    public ApiResponse<MedicationDto> discontinue(@PathVariable Long id) {
        return ApiResponse.success("Medication discontinued", medicationService.discontinue(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        medicationService.delete(id);
        return ApiResponse.success("Medication deleted", null);
    }
}
