package com.mtotocare.africa.user;

import com.mtotocare.africa.common.PageResponse;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.mtotocare.africa.child.ChildRepository childRepository;

    @Transactional(readOnly = true)
    public UserDto getByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserDto::from)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
    }

    @Transactional(readOnly = true)
    public User getEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
    }

    @Transactional(readOnly = true)
    public UserDto getById(Long id) {
        return userRepository.findById(id)
                .map(UserDto::from)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        return getByEmail(SecurityUtils.getCurrentUserEmail());
    }

    @Transactional
    public UserDto updateProfile(String email, String fullName, String phoneNumber, String preferredLanguage) {
        User user = getEntityByEmail(email);
        if (fullName != null && !fullName.isBlank()) user.setFullName(fullName);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);
        if (preferredLanguage != null) user.setPreferredLanguage(preferredLanguage);
        return UserDto.from(userRepository.save(user));
    }

    // ===== Admin operations =====

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT, "EMAIL_EXISTS");
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()
                && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ApiException("Phone already registered", HttpStatus.CONFLICT, "PHONE_EXISTS");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new ApiException("Password must be at least 8 characters", HttpStatus.BAD_REQUEST, "PASSWORD_TOO_SHORT");
        }

        // Normalize roles — at least one role is required
        Set<String> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String r : request.getRoles()) {
                if (r != null && !r.isBlank()) roles.add(r.toUpperCase());
            }
        }
        if (roles.isEmpty()) {
            throw new ApiException("At least one role is required", HttpStatus.BAD_REQUEST, "ROLE_REQUIRED");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()
                        ? request.getPhoneNumber().trim() : null)
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "en")
                .active(true)
                .emailVerified(false)
                .phoneVerified(false)
                // Auto-mark as healthcare provider if any provider role is selected
                .healthcareProvider(roles.stream().anyMatch(r ->
                        r.equals("DOCTOR") || r.equals("NURSE") || r.equals("MIDWIFE")
                                || r.equals("CHW") || r.equals("HEALTHCARE_PROVIDER")))
                .roles(roles)
                .build();

        user = userRepository.save(user);
        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDto> listUsers(String role, Boolean active, String query, int page, int size) {
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
        List<UserDto> pageContent = filtered.subList(from, to).stream().map(UserDto::from).toList();
        return new PageResponse<>(pageContent, total, (int) Math.ceil((double) total / size), size, page);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        if (request.getFullName() != null && !request.getFullName().isBlank()) user.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
        }
        // children.parent_id is ON DELETE RESTRICT, so a parent with any
        // children (including soft-deleted ones) would otherwise fail the
        // delete with a raw DataIntegrityViolationException. Remove the
        // children first — their own child_id foreign keys (vaccinations,
        // growth records, appointments, etc.) all cascade automatically.
        List<com.mtotocare.africa.child.Child> children = childRepository.findByParentId(id);
        if (!children.isEmpty()) {
            childRepository.deleteAll(children);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserDto setActive(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        user.setActive(active);
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto assignRole(Long userId, String role) {
        if (role == null || role.isBlank()) {
            throw new ApiException("Role is required", HttpStatus.BAD_REQUEST, "ROLE_REQUIRED");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        Set<String> roles = user.getRoles() != null ? new HashSet<>(user.getRoles()) : new HashSet<>();
        roles.add(role.toUpperCase());
        user.setRoles(roles);
        // Also flip the healthcare provider flag if relevant
        boolean isProvider = role.toUpperCase().matches("DOCTOR|NURSE|MIDWIFE|CHW|HEALTHCARE_PROVIDER");
        user.setHealthcareProvider(isProvider);
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto removeRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        if (user.getRoles() != null) {
            Set<String> roles = new HashSet<>(user.getRoles());
            roles.remove(role.toUpperCase());
            user.setRoles(roles);
        }
        return UserDto.from(userRepository.save(user));
    }
}
