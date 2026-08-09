package com.mtotocare.africa.device;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService service;

    @PostMapping("/register")
    public ApiResponse<DeviceDto> register(@Valid @RequestBody DeviceRequest request) {
        return ApiResponse.success("Device registered", service.registerOrUpdate(request));
    }

    @GetMapping
    public ApiResponse<List<DeviceDto>> list() {
        return ApiResponse.success(service.listMyDevices());
    }

    @PostMapping("/{deviceId}/deactivate")
    public ApiResponse<String> deactivate(@PathVariable String deviceId) {
        service.deactivate(deviceId);
        return ApiResponse.success("Device deactivated", null);
    }

    @PostMapping("/{deviceId}/biometric")
    public ApiResponse<String> toggleBiometric(@PathVariable String deviceId, @RequestParam boolean enabled) {
        service.updateBiometric(deviceId, enabled);
        return ApiResponse.success("Biometric setting updated", null);
    }
}
