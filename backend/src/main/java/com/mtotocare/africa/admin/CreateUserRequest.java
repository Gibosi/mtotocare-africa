package com.mtotocare.africa.admin;

import java.util.List;

/**
 * Request body for POST /admin/users
 */
public record CreateUserRequest(
        String email,
        String fullName,
        String phoneNumber,
        String password,
        String preferredLanguage,
        List<String> roles,
        // Only used when roles includes a clinical role (DOCTOR/NURSE/MIDWIFE/CHW).
        String licenseNumber,
        String specialization,
        Long facilityId
) {}
