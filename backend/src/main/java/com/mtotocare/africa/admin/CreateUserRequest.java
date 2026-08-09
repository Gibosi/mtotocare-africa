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
        List<String> roles
) {}
