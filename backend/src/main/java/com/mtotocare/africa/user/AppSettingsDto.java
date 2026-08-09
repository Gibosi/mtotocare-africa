package com.mtotocare.africa.user;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSettingsDto {
    private String preferredLanguage;
    private String theme;
    private String dateFormat;
    private String weightUnit;
    private String heightUnit;
    private String temperatureUnit;
    private Boolean enablePushNotifications;
    private Boolean enableEmailNotifications;
    private Boolean enableSmsNotifications;
    private Integer vaccinationReminderDaysBefore;
    private Integer appointmentReminderHoursBefore;
    private Integer growthCheckReminderDays;
    private Boolean shareDataResearch;
    private Boolean enableAiSuggestions;
    private Boolean autoSyncOnWifiOnly;

    public static AppSettingsDto from(AppSettings s) {
        return AppSettingsDto.builder()
                .preferredLanguage(s.getPreferredLanguage())
                .theme(s.getTheme())
                .dateFormat(s.getDateFormat())
                .weightUnit(s.getWeightUnit())
                .heightUnit(s.getHeightUnit())
                .temperatureUnit(s.getTemperatureUnit())
                .enablePushNotifications(s.getEnablePushNotifications())
                .enableEmailNotifications(s.getEnableEmailNotifications())
                .enableSmsNotifications(s.getEnableSmsNotifications())
                .vaccinationReminderDaysBefore(s.getVaccinationReminderDaysBefore())
                .appointmentReminderHoursBefore(s.getAppointmentReminderHoursBefore())
                .growthCheckReminderDays(s.getGrowthCheckReminderDays())
                .shareDataResearch(s.getShareDataResearch())
                .enableAiSuggestions(s.getEnableAiSuggestions())
                .autoSyncOnWifiOnly(s.getAutoSyncOnWifiOnly())
                .build();
    }
}
