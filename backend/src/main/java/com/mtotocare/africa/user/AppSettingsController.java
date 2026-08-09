package com.mtotocare.africa.user;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class AppSettingsController {

    private final AppSettingsService service;

    @GetMapping
    public ApiResponse<AppSettingsDto> get() {
        return ApiResponse.success(service.get());
    }

    @PutMapping
    public ApiResponse<AppSettingsDto> update(@RequestBody AppSettingsDto updates) {
        return ApiResponse.success("Settings updated", service.update(updates));
    }
}
