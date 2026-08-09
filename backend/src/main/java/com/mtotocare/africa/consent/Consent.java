package com.mtotocare.africa.consent;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.user.User;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consents", indexes = {
    @Index(name = "idx_consent_user", columnList = "user_id"),
    @Index(name = "idx_consent_type", columnList = "consent_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "consent_type", nullable = false, length = 50)
    private String consentType;
    // TERMS_OF_SERVICE, PRIVACY_POLICY, DATA_PROCESSING, MARKETING_EMAILS,
    // PUSH_NOTIFICATIONS, AI_ASSISTANT, DATA_SHARING_RESEARCH, CHILD_DATA_PROCESSING

    @Column(name = "version", length = 20)
    private String version;

    @Column(name = "granted", nullable = false)
    @Builder.Default
    private Boolean granted = false;

    @Column(name = "granted_at")
    private LocalDateTime grantedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "notes", length = 500)
    private String notes;
}
