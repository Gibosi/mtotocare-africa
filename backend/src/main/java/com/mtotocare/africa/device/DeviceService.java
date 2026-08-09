package com.mtotocare.africa.device;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public DeviceDto registerOrUpdate(DeviceRequest request) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));

        Device device = repository.findByDeviceId(request.getDeviceId())
                .map(existing -> {
                    // Re-bind device to current user (handles multi-user-per-device scenarios)
                    existing.setUser(user);
                    return existing;
                })
                .orElseGet(() -> Device.builder().user(user).deviceId(request.getDeviceId()).build());

        device.setPushToken(request.getPushToken());
        device.setPlatform(request.getPlatform());
        device.setAppVersion(request.getAppVersion());
        device.setOsVersion(request.getOsVersion());
        device.setDeviceModel(request.getDeviceModel());
        device.setManufacturer(request.getManufacturer());
        if (request.getLocale() != null) device.setLocale(request.getLocale());
        if (request.getTimezone() != null) device.setTimezone(request.getTimezone());
        device.setBiometricEnabled(Boolean.TRUE.equals(request.getBiometricEnabled()));
        device.setActive(true);
        device.setLastActiveAt(LocalDateTime.now());

        device = repository.save(device);
        log.info("Device registered: user={}, device={}, platform={}", user.getEmail(), device.getDeviceId(), device.getPlatform());
        return DeviceDto.from(device);
    }

    @Transactional(readOnly = true)
    public List<DeviceDto> listMyDevices() {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        return repository.findByUserIdAndActiveTrue(user.getId())
                .stream().map(DeviceDto::from).collect(Collectors.toList());
    }

    @Transactional
    public void updateBiometric(String deviceId, boolean enabled) {
        Device d = repository.findByDeviceId(deviceId)
                .orElseThrow(() -> new ApiException("Device not found", HttpStatus.NOT_FOUND, "DEVICE_NOT_FOUND"));
        d.setBiometricEnabled(enabled);
        repository.save(d);
    }

    @Transactional
    public void deactivate(String deviceId) {
        Device d = repository.findByDeviceId(deviceId)
                .orElseThrow(() -> new ApiException("Device not found", HttpStatus.NOT_FOUND, "DEVICE_NOT_FOUND"));
        d.setActive(false);
        repository.save(d);
        log.info("Device deactivated: {}", deviceId);
    }
}
