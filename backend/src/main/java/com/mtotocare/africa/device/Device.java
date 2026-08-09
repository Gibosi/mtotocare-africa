package com.mtotocare.africa.device;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.user.User;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "devices", indexes = {
    @Index(name = "idx_device_user", columnList = "user_id"),
    @Index(name = "idx_device_token", columnList = "push_token", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "device_id", nullable = false, length = 200)
    private String deviceId; // unique per device installation

    @Column(name = "push_token", length = 500)
    private String pushToken; // FCM/APNs token

    @Column(name = "platform", nullable = false, length = 20)
    private String platform; // ANDROID, IOS, WEB

    @Column(name = "app_version", length = 20)
    private String appVersion;

    @Column(name = "os_version", length = 50)
    private String osVersion;

    @Column(name = "device_model", length = 100)
    private String deviceModel;

    @Column(name = "manufacturer", length = 100)
    private String manufacturer;

    @Column(name = "locale", length = 10)
    @Builder.Default
    private String locale = "en";

    @Column(name = "timezone", length = 50)
    @Builder.Default
    private String timezone = "Africa/Dar_es_Salaam";

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "biometric_enabled", nullable = false)
    @Builder.Default
    private Boolean biometricEnabled = false;
}
