package com.mtotocare.africa.auth;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * One-time password (OTP) for phone verification.
 * FR-003: "The system shall verify phone numbers using a one-time password (OTP)."
 */
@Entity
@Table(name = "phone_otp_tokens", indexes = {
    @Index(name = "idx_otp_phone", columnList = "phone_number"),
    @Index(name = "idx_otp_code", columnList = "code"),
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneOtpToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "code", nullable = false, length = 6)
    private String code;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "attempts", nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean isUsed() {
        return usedAt != null;
    }
}
