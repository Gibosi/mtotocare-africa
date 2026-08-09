package com.mtotocare.africa.user;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Set;

/**
 * Payload for admin-initiated user creation (POST /users).
 * Unlike public registration, this lets an admin pick the roles,
 * mark the user as active, and skip the welcome email.
 */
@Data
public class CreateUserRequest {

    @Email
    @NotBlank
    @Size(max = 150)
    private String email;

    @NotBlank
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
    private String password;

    @NotBlank
    @Size(max = 150)
    private String fullName;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 5)
    private String preferredLanguage = "en";

    /**
     * Roles to assign. Must be non-empty. Examples: PARENT, DOCTOR, NURSE,
     * MIDWIFE, CHW, HEALTHCARE_PROVIDER, ADMIN.
     */
    private Set<String> roles;
}
