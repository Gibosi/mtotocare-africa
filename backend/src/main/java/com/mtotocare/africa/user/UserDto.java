package com.mtotocare.africa.user;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String preferredLanguage;
    private Boolean active;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private Boolean healthcareProvider;
    private String licenseNumber;
    private String specialization;
    private Long clinicId;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    /** Populated by the admin user-list endpoint for healthcare-provider users. */
    private Long doctorId;
    private Boolean credentialsVerified;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .preferredLanguage(user.getPreferredLanguage())
                .active(user.getActive())
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .healthcareProvider(user.getHealthcareProvider())
                .licenseNumber(user.getLicenseNumber())
                .specialization(user.getSpecialization())
                .clinicId(user.getClinicId())
                .roles(user.getRoles())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
