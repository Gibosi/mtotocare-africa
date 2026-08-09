package com.mtotocare.africa.device;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class DeviceRequest {
    @NotBlank
    private String deviceId;
    private String pushToken;
    @NotNull
    private String platform; // ANDROID, IOS, WEB
    private String appVersion;
    private String osVersion;
    private String deviceModel;
    private String manufacturer;
    private String locale;
    private String timezone;
    private Boolean biometricEnabled;
}
