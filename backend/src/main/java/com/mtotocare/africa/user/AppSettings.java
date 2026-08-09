package com.mtotocare.africa.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "app_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSettings extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "preferred_language", length = 10)
    @Builder.Default
    private String preferredLanguage = "en";

    @Column(name = "theme", length = 20)
    @Builder.Default
    private String theme = "SYSTEM"; // LIGHT, DARK, SYSTEM

    @Column(name = "date_format", length = 20)
    @Builder.Default
    private String dateFormat = "YYYY-MM-DD";

    @Column(name = "weight_unit", length = 10)
    @Builder.Default
    private String weightUnit = "KG"; // KG, LB

    @Column(name = "height_unit", length = 10)
    @Builder.Default
    private String heightUnit = "CM"; // CM, IN

    @Column(name = "temperature_unit", length = 10)
    @Builder.Default
    private String temperatureUnit = "CELSIUS"; // CELSIUS, FAHRENHEIT

    @Column(name = "enable_push_notifications", nullable = false)
    @Builder.Default
    private Boolean enablePushNotifications = true;

    @Column(name = "enable_email_notifications", nullable = false)
    @Builder.Default
    private Boolean enableEmailNotifications = true;

    @Column(name = "enable_sms_notifications", nullable = false)
    @Builder.Default
    private Boolean enableSmsNotifications = false;

    @Column(name = "vaccination_reminder_days_before")
    @Builder.Default
    private Integer vaccinationReminderDaysBefore = 7;

    @Column(name = "appointment_reminder_hours_before")
    @Builder.Default
    private Integer appointmentReminderHoursBefore = 24;

    @Column(name = "growth_check_reminder_days")
    @Builder.Default
    private Integer growthCheckReminderDays = 30;

    @Column(name = "share_data_research", nullable = false)
    @Builder.Default
    private Boolean shareDataResearch = false;

    @Column(name = "enable_ai_suggestions", nullable = false)
    @Builder.Default
    private Boolean enableAiSuggestions = true;

    @Column(name = "auto_sync_on_wifi_only", nullable = false)
    @Builder.Default
    private Boolean autoSyncOnWifiOnly = true;
}
