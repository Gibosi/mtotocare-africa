package com.mtotocare.africa.user;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppSettingsService {

    private final AppSettingsRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public AppSettingsDto get() {
        User user = getCurrentUser();
        AppSettings settings = repository.findByUserId(user.getId())
                .orElseGet(() -> repository.save(AppSettings.builder().user(user).build()));
        return AppSettingsDto.from(settings);
    }

    @Transactional
    public AppSettingsDto update(AppSettingsDto updates) {
        User user = getCurrentUser();
        AppSettings settings = repository.findByUserId(user.getId())
                .orElseGet(() -> AppSettings.builder().user(user).build());

        if (updates.getPreferredLanguage() != null) settings.setPreferredLanguage(updates.getPreferredLanguage());
        if (updates.getTheme() != null) settings.setTheme(updates.getTheme());
        if (updates.getDateFormat() != null) settings.setDateFormat(updates.getDateFormat());
        if (updates.getWeightUnit() != null) settings.setWeightUnit(updates.getWeightUnit());
        if (updates.getHeightUnit() != null) settings.setHeightUnit(updates.getHeightUnit());
        if (updates.getTemperatureUnit() != null) settings.setTemperatureUnit(updates.getTemperatureUnit());
        if (updates.getEnablePushNotifications() != null) settings.setEnablePushNotifications(updates.getEnablePushNotifications());
        if (updates.getEnableEmailNotifications() != null) settings.setEnableEmailNotifications(updates.getEnableEmailNotifications());
        if (updates.getEnableSmsNotifications() != null) settings.setEnableSmsNotifications(updates.getEnableSmsNotifications());
        if (updates.getVaccinationReminderDaysBefore() != null) settings.setVaccinationReminderDaysBefore(updates.getVaccinationReminderDaysBefore());
        if (updates.getAppointmentReminderHoursBefore() != null) settings.setAppointmentReminderHoursBefore(updates.getAppointmentReminderHoursBefore());
        if (updates.getGrowthCheckReminderDays() != null) settings.setGrowthCheckReminderDays(updates.getGrowthCheckReminderDays());
        if (updates.getShareDataResearch() != null) settings.setShareDataResearch(updates.getShareDataResearch());
        if (updates.getEnableAiSuggestions() != null) settings.setEnableAiSuggestions(updates.getEnableAiSuggestions());
        if (updates.getAutoSyncOnWifiOnly() != null) settings.setAutoSyncOnWifiOnly(updates.getAutoSyncOnWifiOnly());

        return AppSettingsDto.from(repository.save(settings));
    }

    private User getCurrentUser() {
        return userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
    }
}
