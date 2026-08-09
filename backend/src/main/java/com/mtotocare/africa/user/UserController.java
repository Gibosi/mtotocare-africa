package com.mtotocare.africa.user;

import com.mtotocare.africa.audit.AuditService;
import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.common.PageResponse;
import com.mtotocare.africa.common.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuditService auditService;

    @GetMapping("/me")
    public ApiResponse<UserDto> getCurrentUser() {
        return ApiResponse.success(userService.getByEmail(SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/me")
    public ApiResponse<UserDto> updateProfile(@RequestBody UserUpdateRequest request,
                                              javax.servlet.http.HttpServletRequest http) {
        String before = userService.getByEmail(SecurityUtils.getCurrentUserEmail()).getFullName();
        UserDto updated = userService.updateProfile(
                SecurityUtils.getCurrentUserEmail(),
                request.getFullName(),
                request.getPhoneNumber(),
                request.getPreferredLanguage());
        // NFR-023: audit self profile changes
        if (auditService != null) {
            auditService.record("UPDATE_OWN_PROFILE", "User", updated.getId(),
                    "Self profile update: name '" + before + "' -> '" + updated.getFullName() + "'", http);
        }
        return ApiResponse.success("Profile updated", updated);
    }

    // ===== User CRUD (admin) =====

    /**
     * Create a new user with the given roles. Admin-only.
     * The user is created active, but email is not verified (they will
     * get a welcome email with their password to sign in).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success("User created", userService.createUser(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<UserDto>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(userService.listUsers(role, active, query, page, size));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<UserDto> getUser(@PathVariable Long id) {
        return ApiResponse.success(userService.getById(id));
    }

    // Allow admin to update any user, OR a user to update their own profile
    @PreAuthorize("hasRole('ADMIN') or @userAuthz.isSelf(authentication, #id)")
    @PutMapping("/{id}")
    public ApiResponse<UserDto> updateUser(@PathVariable Long id,
                                           @RequestBody UserUpdateRequest request,
                                           HttpServletRequest http) {
        UserDto updated = userService.updateUser(id, request);
        if (auditService != null) {
            auditService.record("UPDATE_USER", "User", id,
                    "Updated user " + updated.getEmail() + " (name=" + updated.getFullName() + ")", http);
        }
        return ApiResponse.success("User updated", updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable Long id, HttpServletRequest http) {
        String email = "id " + id;
        try { email = userService.getById(id).getEmail(); } catch (Exception ignore) {}
        userService.deleteUser(id);
        if (auditService != null) {
            auditService.record("DELETE_USER", "User", id, "Deleted user " + email, http);
        }
        return ApiResponse.success("User deleted", null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/activate")
    public ApiResponse<UserDto> activateUser(@PathVariable Long id) {
        return ApiResponse.success("User activated", userService.setActive(id, true));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/deactivate")
    public ApiResponse<UserDto> deactivateUser(@PathVariable Long id) {
        return ApiResponse.success("User deactivated", userService.setActive(id, false));
    }

    // ===== Role management =====

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{userId}/roles")
    public ApiResponse<UserDto> assignRole(@PathVariable Long userId,
                                           @RequestBody Map<String, String> body,
                                           HttpServletRequest http) {
        UserDto updated = userService.assignRole(userId, body.get("role"));
        if (auditService != null) {
            auditService.record("ASSIGN_ROLE", "User", userId,
                    "Assigned role " + body.get("role") + " to " + updated.getEmail(), http);
        }
        return ApiResponse.success("Role assigned", updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userId}/roles/{role}")
    public ApiResponse<UserDto> removeRole(@PathVariable Long userId,
                                           @PathVariable String role,
                                           HttpServletRequest http) {
        UserDto updated = userService.removeRole(userId, role);
        if (auditService != null) {
            auditService.record("REMOVE_ROLE", "User", userId,
                    "Removed role " + role + " from " + updated.getEmail(), http);
        }
        return ApiResponse.success("Role removed", updated);
    }
}
