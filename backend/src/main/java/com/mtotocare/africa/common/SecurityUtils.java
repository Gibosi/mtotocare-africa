package com.mtotocare.africa.common;

import com.mtotocare.africa.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.Set;

public class SecurityUtils {

    private SecurityUtils() {}

    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new ApiException("Not authenticated", HttpStatus.UNAUTHORIZED, "NOT_AUTHENTICATED");
        }
        return auth.getName();
    }

    public static boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName());
    }

    /**
     * True if the current user holds any of the given roles (without the
     * "ROLE_" prefix, e.g. hasAnyRole("DOCTOR", "NURSE")). Used to let
     * clinical staff access a parent-owned resource (growth, vaccinations,
     * milestones) alongside the owning parent.
     */
    public static boolean hasAnyRole(String... roles) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        Set<String> wanted = Set.of(Arrays.stream(roles).map(r -> "ROLE_" + r).toArray(String[]::new));
        for (GrantedAuthority a : auth.getAuthorities()) {
            if (wanted.contains(a.getAuthority())) return true;
        }
        return false;
    }
}
