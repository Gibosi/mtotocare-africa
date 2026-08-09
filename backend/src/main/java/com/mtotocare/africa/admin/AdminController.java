package com.mtotocare.africa.admin;

import com.mtotocare.africa.audit.AuditService;
import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.common.PageResponse;
import com.mtotocare.africa.doctor.Doctor;
import com.mtotocare.africa.doctor.DoctorRepository;
import com.mtotocare.africa.facility.Facility;
import com.mtotocare.africa.facility.FacilityRepository;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserDto;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Admin-only endpoints for managing users, facilities, audit logs, system settings, and stats.
 * All endpoints require the user to have the ADMIN role.
 * Mutating endpoints (POST/PUT/DELETE) auto-record an entry in the audit log.
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final FacilityRepository facilityRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final com.mtotocare.africa.user.UserService userService;
    private final com.mtotocare.africa.sync.SyncLogRepository syncLogRepository;
    private final com.mtotocare.africa.child.ChildRepository childRepository;
    private final com.mtotocare.africa.appointment.AppointmentRepository appointmentRepository;
    private final com.mtotocare.africa.vaccination.VaccinationRepository vaccinationRepository;

    // =========== USERS ===========

    @GetMapping("/users")
    public ApiResponse<PageResponse<UserDto>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<User> all = userRepository.findAll();
        List<User> filtered = all.stream()
                .filter(u -> role == null || (u.getRoles() != null && u.getRoles().contains(role)))
                .filter(u -> active == null || (active == u.getActive()))
                .filter(u -> query == null || query.isBlank() ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(query.toLowerCase())) ||
                        (u.getFullName() != null && u.getFullName().toLowerCase().contains(query.toLowerCase())))
                .sorted((a, b) -> a.getId().compareTo(b.getId()))
                .collect(Collectors.toList());

        int total = filtered.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        List<UserDto> page_content = filtered.subList(from, to).stream().map(UserDto::from).toList();
        return ApiResponse.success(new PageResponse<>(page_content, total, (int) Math.ceil((double) total / size), size, page));
    }

    @PostMapping("/users")
    public ApiResponse<UserDto> createUser(@RequestBody CreateUserRequest request, HttpServletRequest http) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ApiResponse.error("Email already registered", "EMAIL_EXISTS");
        }
        Set<String> roles = request.roles() != null && !request.roles().isEmpty()
                ? new HashSet<>(request.roles())
                : Set.of("PARENT");
        User user = User.builder()
                .email(request.email())
                .fullName(request.fullName())
                .phoneNumber(request.phoneNumber())
                .passwordHash(passwordEncoder.encode(request.password()))
                .preferredLanguage(request.preferredLanguage() != null ? request.preferredLanguage() : "en")
                .active(true)
                .emailVerified(true)
                .phoneVerified(true)
                .healthcareProvider(roles.stream().anyMatch(r -> r.equals("DOCTOR") || r.equals("NURSE") || r.equals("MIDWIFE") || r.equals("CHW")))
                .roles(roles)
                .build();
        user = userRepository.save(user);

        // If the user has a healthcare role, also create a Doctor profile
        boolean isProvider = roles.stream().anyMatch(r -> r.equals("DOCTOR") || r.equals("NURSE") || r.equals("MIDWIFE") || r.equals("CHW"));
        if (isProvider && !doctorRepository.findByUserId(user.getId()).isPresent()) {
            Facility defaultFacility = facilityRepository.findAll().stream().findFirst().orElse(null);
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .licenseNumber("TZ-" + System.currentTimeMillis())
                    .specialization(roles.contains("DOCTOR") ? "General Practice" : "Healthcare")
                    .subSpecialty("")
                    .yearsOfExperience(0)
                    .bio("")
                    .acceptingNewPatients(true)
                    .primaryFacility(defaultFacility)
                    .consultationFee(0.0)
                    .build();
            doctorRepository.save(doctor);
        }

        auditService.record("CREATE_USER", "User", user.getId(),
                "Created user " + user.getEmail() + " with roles " + roles, http);

        return ApiResponse.success("User created", UserDto.from(user));
    }

    @PutMapping("/users/{id}/activate")
    public ApiResponse<UserDto> activateUser(@PathVariable Long id, HttpServletRequest http) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return ApiResponse.error("User not found", "USER_NOT_FOUND");
        u.setActive(true);
        UserDto dto = UserDto.from(userRepository.save(u));
        auditService.record("ACTIVATE_USER", "User", id, "Activated " + u.getEmail(), http);
        return ApiResponse.success("User activated", dto);
    }

    @PutMapping("/users/{id}/deactivate")
    public ApiResponse<UserDto> deactivateUser(@PathVariable Long id, HttpServletRequest http) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return ApiResponse.error("User not found", "USER_NOT_FOUND");
        u.setActive(false);
        UserDto dto = UserDto.from(userRepository.save(u));
        auditService.record("DEACTIVATE_USER", "User", id, "Deactivated " + u.getEmail(), http);
        return ApiResponse.success("User deactivated", dto);
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<String> deleteUser(@PathVariable Long id, HttpServletRequest http) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return ApiResponse.error("User not found", "USER_NOT_FOUND");
        userService.deleteUser(id);
        auditService.record("DELETE_USER", "User", id, "Deleted " + u.getEmail(), http);
        return ApiResponse.success("User deleted", null);
    }

    @PostMapping("/users/{id}/reset-password")
    public ApiResponse<String> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> body, HttpServletRequest http) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return ApiResponse.error("User not found", "USER_NOT_FOUND");
        String newPassword = body.getOrDefault("newPassword", "MtotoCare2026!");
        u.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(u);
        auditService.record("RESET_PASSWORD", "User", id, "Reset password for " + u.getEmail(), http);
        return ApiResponse.success("Password reset to: " + newPassword, null);
    }

    // =========== ROLE MANAGEMENT (admin) ===========

    @PostMapping("/users/{userId}/roles")
    public ApiResponse<UserDto> assignRole(@PathVariable Long userId,
                                           @RequestBody Map<String, String> body,
                                           HttpServletRequest http) {
        User u = userRepository.findById(userId).orElse(null);
        if (u == null) return ApiResponse.error("User not found", "USER_NOT_FOUND");
        String role = body.get("role");
        if (u.getRoles() == null) u.setRoles(new HashSet<>());
        u.getRoles().add(role.toUpperCase());
        u.setHealthcareProvider(u.getRoles().stream().anyMatch(r ->
                r.equals("DOCTOR") || r.equals("NURSE") || r.equals("MIDWIFE") || r.equals("CHW") || r.equals("HEALTHCARE_PROVIDER")));
        User saved = userRepository.save(u);
        auditService.record("ASSIGN_ROLE", "User", userId, "Assigned role " + role + " to " + u.getEmail(), http);
        return ApiResponse.success("Role assigned", UserDto.from(saved));
    }

    @DeleteMapping("/users/{userId}/roles/{role}")
    public ApiResponse<UserDto> removeRole(@PathVariable Long userId,
                                           @PathVariable String role,
                                           HttpServletRequest http) {
        User u = userRepository.findById(userId).orElse(null);
        if (u == null) return ApiResponse.error("User not found", "USER_NOT_FOUND");
        if (u.getRoles() != null) {
            u.getRoles().remove(role.toUpperCase());
        }
        User saved = userRepository.save(u);
        auditService.record("REMOVE_ROLE", "User", userId, "Removed role " + role + " from " + u.getEmail(), http);
        return ApiResponse.success("Role removed", UserDto.from(saved));
    }

    // =========== STATS ===========

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        long total = userRepository.count();
        long admins = userRepository.findAll().stream().filter(u -> u.getRoles() != null && u.getRoles().contains("ADMIN")).count();
        long parents = userRepository.findAll().stream().filter(u -> u.getRoles() != null && u.getRoles().contains("PARENT")).count();
        long providers = userRepository.findAll().stream().filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> r.equals("DOCTOR") || r.equals("NURSE") || r.equals("MIDWIFE") || r.equals("CHW"))).count();
        long active = userRepository.findAll().stream().filter(u -> Boolean.TRUE.equals(u.getActive())).count();
        long facilityCount = facilityRepository.count();
        long doctorCount = doctorRepository.count();
        long childCount = childRepository.count();
        long appointmentCount = appointmentRepository.count();
        long vaccinationCount = vaccinationRepository.count();

        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        // Canonical keys — used by the mobile admin dashboard.
        stats.put("totalUsers", total);
        stats.put("totalChildren", childCount);
        stats.put("totalAppointments", appointmentCount);
        stats.put("totalVaccinations", vaccinationCount);
        stats.put("adminCount", admins);
        stats.put("parentCount", parents);
        stats.put("providerCount", providers);
        stats.put("activeCount", active);
        stats.put("facilities", facilityCount);
        stats.put("doctors", doctorCount);
        // Legacy alias kept for anything else still reading it.
        stats.put("children", childCount);
        return ApiResponse.success(stats);
    }

    // =========== SYNC ===========

    /**
     * Aggregate sync health across all devices, drawn from real sync_logs
     * rows (each mobile batch-sync call writes one). "pendingCount" and
     * "failedCount" aren't tracked server-side yet — the sync protocol
     * doesn't currently have clients report per-item failures — so they're
     * reported as 0 rather than a fabricated number; syncedToday is real.
     */
    @GetMapping("/sync/status")
    public ApiResponse<Map<String, Object>> getSyncStatus() {
        java.time.LocalDateTime startOfToday = java.time.LocalDate.now().atStartOfDay();
        List<com.mtotocare.africa.sync.SyncLog> allLogs = syncLogRepository.findAll();
        long syncedToday = allLogs.stream()
                .filter(s -> s.getSyncedAt() != null && s.getSyncedAt().isAfter(startOfToday))
                .mapToLong(s -> (s.getRecordsUploaded() == null ? 0 : s.getRecordsUploaded())
                        + (s.getRecordsDownloaded() == null ? 0 : s.getRecordsDownloaded()))
                .sum();
        java.util.Optional<java.time.LocalDateTime> lastSync = allLogs.stream()
                .map(com.mtotocare.africa.sync.SyncLog::getSyncedAt)
                .filter(java.util.Objects::nonNull)
                .max(java.time.LocalDateTime::compareTo);

        Map<String, Object> status = new java.util.LinkedHashMap<>();
        status.put("pendingCount", 0);
        status.put("syncedToday", syncedToday);
        status.put("failedCount", 0);
        status.put("lastSyncAt", lastSync.orElse(null));
        return ApiResponse.success(status);
    }

    // =========== FACILITIES ===========

    @GetMapping("/facilities")
    public ApiResponse<List<Facility>> listFacilities() {
        return ApiResponse.success(facilityRepository.findAll());
    }

    @PostMapping("/facilities")
    public ApiResponse<Facility> createFacility(@RequestBody Map<String, Object> body, HttpServletRequest http) {
        Facility f = Facility.builder()
                .name((String) body.getOrDefault("name", "New Facility"))
                .facilityType((String) body.getOrDefault("facilityType", "HEALTH_CENTER"))
                .address((String) body.getOrDefault("address", ""))
                .region((String) body.getOrDefault("region", ""))
                .district((String) body.getOrDefault("district", ""))
                .phoneNumber((String) body.getOrDefault("phoneNumber", ""))
                .operatingHours((String) body.getOrDefault("operatingHours", "24/7"))
                .active(true)
                .build();
        f = facilityRepository.save(f);
        auditService.record("CREATE_FACILITY", "Facility", f.getId(),
                "Created facility " + f.getName() + " in " + f.getRegion(), http);
        return ApiResponse.success("Facility created", f);
    }

    @DeleteMapping("/facilities/{id}")
    public ApiResponse<String> deleteFacility(@PathVariable Long id, HttpServletRequest http) {
        Facility f = facilityRepository.findById(id).orElse(null);
        facilityRepository.deleteById(id);
        auditService.record("DELETE_FACILITY", "Facility", id,
                f != null ? "Deleted " + f.getName() : "Deleted facility id " + id, http);
        return ApiResponse.success("Facility deleted", null);
    }

    // =========== AUDIT (delegates to AuditService) ===========

    @GetMapping("/audit-logs")
    public ApiResponse<PageResponse<Map<String, Object>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search) {
        return ApiResponse.success(auditService.list(page, size, search));
    }

    // =========== SETTINGS (stub) ===========

    @GetMapping("/settings")
    public ApiResponse<Map<String, Object>> getSettings() {
        return ApiResponse.success(Map.of(
                "appName", "MtotoCare Africa",
                "appVersion", "1.0.0",
                "maintenanceMode", false,
                "registrationEnabled", true,
                "maxChildrenPerParent", 10,
                "jwtAccessTokenExpiration", 900,
                "jwtRefreshTokenExpiration", 604800,
                "smsGatewayEnabled", false,
                "emailGatewayEnabled", true,
                "pushNotificationsEnabled", false
        ));
    }

    @PutMapping("/settings")
    public ApiResponse<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> body, HttpServletRequest http) {
        auditService.record("UPDATE_SETTINGS", "System", null,
                "Updated system settings: " + body.keySet(), http);
        return ApiResponse.success(body);
    }
}
