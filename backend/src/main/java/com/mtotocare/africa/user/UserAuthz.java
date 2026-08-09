package com.mtotocare.africa.user;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Helper bean for @PreAuthorize SpEL expressions.
 *
 * Used in UserController so a non-admin user (e.g. a doctor) can update
 * their own profile via PUT /users/{id} but cannot update other users.
 */
@Component("userAuthz")
@RequiredArgsConstructor
public class UserAuthz {

    private final UserRepository userRepository;

    public boolean isSelf(Authentication authentication, Long userId) {
        if (authentication == null || userId == null) return false;
        String principalEmail = authentication.getName();
        if (principalEmail == null || principalEmail.isBlank()) return false;
        try {
            User target = userRepository.findById(userId).orElse(null);
            if (target == null) return false;
            return principalEmail.equalsIgnoreCase(target.getEmail());
        } catch (Exception e) {
            return false;
        }
    }
}
