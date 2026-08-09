package com.mtotocare.africa.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    @Size(max = 150)
    private String fullName;

    @NotBlank
    @Email
    private String email;

    private String phoneNumber;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    @NotBlank
    private String confirmPassword;

    private String preferredLanguage;
    private String deviceId;
}
