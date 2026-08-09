package com.mtotocare.africa.device;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByDeviceId(String deviceId);
    List<Device> findByUserIdAndActiveTrue(Long userId);
    List<Device> findByPushToken(String pushToken);
}
