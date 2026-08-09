package com.mtotocare.africa.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_phone", columnList = "phone_number", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @NotBlank
    @Size(max = 150)
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 100)
    @JsonIgnore
    private String passwordHash;

    @NotBlank
    @Size(max = 150)
    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Size(max = 20)
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "preferred_language", length = 5)
    @Builder.Default
    private String preferredLanguage = "en";

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "phone_verified", nullable = false)
    @Builder.Default
    private Boolean phoneVerified = false;

    @Column(name = "healthcare_provider", nullable = false)
    @Builder.Default
    private Boolean healthcareProvider = false;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(name = "specialization", length = 100)
    private String specialization;

    @Column(name = "clinic_id")
    private Long clinicId;

    @Column(name = "last_login_at")
    private java.time.LocalDateTime lastLoginAt;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @ElementCollection(fetch = FetchType.EAGER, targetClass = String.class)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", length = 30)
    @Builder.Default
    private Set<String> roles = new HashSet<>();

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }

    public boolean isHealthcareProvider() {
        return Boolean.TRUE.equals(healthcareProvider);
    }

    public String getFullName() {
        return fullName;
    }
}
