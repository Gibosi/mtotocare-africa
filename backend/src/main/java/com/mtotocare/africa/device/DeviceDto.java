package com.mtotocare.africa.device;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceDto {
    private Long id;
    private String deviceId;
    private String pushToken;
    private String platform;
    private String appVersion;
    private String osVersion;
    private String deviceModel;
    private String manufacturer;
    private String locale;
    private String timezone;
    private Boolean active;
    private Boolean biometricEnabled;

    public static DeviceDto from(Device d) {
        return DeviceDto.builder()
                .id(d.getId())
                .deviceId(d.getDeviceId())
                .pushToken(d.getPushToken())
                .platform(d.getPlatform())
                .appVersion(d.getAppVersion())
                .osVersion(d.getOsVersion())
                .deviceModel(d.getDeviceModel())
                .manufacturer(d.getManufacturer())
                .locale(d.getLocale())
                .timezone(d.getTimezone())
                .active(d.getActive())
                .biometricEnabled(d.getBiometricEnabled())
                .build();
    }
}
