package com.mtotocare.africa.auth;

import com.mtotocare.africa.common.EmailProperties;
import com.mtotocare.africa.common.EmailService;
import com.mtotocare.africa.common.EmailTemplates;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.security.JwtTokenProvider;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserDto;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final SessionRepository sessionRepository;
    private final EmailService emailService;
    private final EmailProperties emailProperties;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ApiException("Passwords do not match", HttpStatus.BAD_REQUEST, "PASSWORD_MISMATCH");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT, "EMAIL_EXISTS");
        }
        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ApiException("Phone already registered", HttpStatus.CONFLICT, "PHONE_EXISTS");
        }

        Set<String> roles = new HashSet<>();
        roles.add("PARENT");

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "en")
                .active(true)
                .emailVerified(false)
                .phoneVerified(false)
                .healthcareProvider(false)
                .roles(roles)
                .build();

        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        // Send a welcome email in the user's preferred language. Best-effort.
        try {
            String lang = user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "en";
            String html = EmailTemplates.welcome(user.getFullName(), emailProperties.getAppBaseUrl(), lang);
            String subject = "sw".equals(lang) ? "Karibu MtotoCare Africa" : "Welcome to MtotoCare Africa";
            emailService.send(user.getEmail(), subject, html);
        } catch (Exception e) {
            log.warn("Welcome email failed for {}: {}", user.getEmail(), e.getMessage());
        }

        return buildAuthResponse(user, request.getDeviceId());
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String deviceId, String ipAddress, String userAgent) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Failed login for: {}", request.getEmail());
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new ApiException("Account deactivated", HttpStatus.FORBIDDEN, "ACCOUNT_INACTIVE");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        return buildAuthResponseWithSession(user, deviceId, ipAddress, userAgent);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken, String deviceId, String ipAddress, String userAgent) {
        Session session = sessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new ApiException("Session not found", HttpStatus.UNAUTHORIZED, "SESSION_NOT_FOUND"));

        if (Boolean.TRUE.equals(session.getRevoked())) {
            throw new ApiException("Session revoked", HttpStatus.UNAUTHORIZED, "SESSION_REVOKED");
        }
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Session expired", HttpStatus.UNAUTHORIZED, "SESSION_EXPIRED");
        }

        User user = session.getUser();

        // Rotate: revoke this session, create a new one
        session.setRevoked(true);
        session.setRevokedAt(LocalDateTime.now());
        sessionRepository.save(session);

        return buildAuthResponseWithSession(user, deviceId, ipAddress, userAgent);
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ApiException("Current password is incorrect", HttpStatus.BAD_REQUEST, "INVALID_PASSWORD");
        }
        if (currentPassword.equals(newPassword)) {
            throw new ApiException("New password must differ from current", HttpStatus.BAD_REQUEST, "SAME_PASSWORD");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        // Revoke all sessions to force re-login
        sessionRepository.findByUserIdAndRevokedFalse(user.getId())
                .forEach(s -> { s.setRevoked(true); s.setRevokedAt(LocalDateTime.now()); });
        log.info("Password changed for: {}", email);
    }

    @Transactional
    public String forgotPassword(String email, String ipAddress) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Don't leak whether email exists; return success anyway
            log.info("Password reset requested for unknown email: {}", email);
            return "If the email exists, a reset link has been sent";
        }

        // Invalidate any existing tokens
        // (would need query — for simplicity, just create a new one)

        String token = generateSecureToken();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(1))
                .ipAddress(ipAddress)
                .build();
        resetTokenRepository.save(resetToken);

        // Send the actual email in the user's preferred language. In sandbox mode
        // (no SENDGRID_API_KEY) the .eml is written to ./eml-outbox/ on the backend host.
        String lang = user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "en";
        String html = EmailTemplates.passwordReset(
                user.getFullName(), token, emailProperties.getAppBaseUrl(), lang);
        String subject = "sw".equals(lang)
                ? "Rudisha nenosiri lako la MtotoCare Africa"
                : "Reset your MtotoCare Africa password";
        boolean sent = emailService.send(user.getEmail(), subject, html);
        if (sent) {
            log.info("Password reset email dispatched to {}", user.getEmail());
        } else {
            log.error("Password reset email FAILED to send for {}. Token (dev only): {}",
                    user.getEmail(), token);
        }
        return "If the email exists, a reset link has been sent";
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ApiException("Invalid or expired token", HttpStatus.BAD_REQUEST, "INVALID_TOKEN"));

        if (resetToken.isExpired()) {
            throw new ApiException("Reset token expired", HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED");
        }
        if (resetToken.isUsed()) {
            throw new ApiException("Reset token already used", HttpStatus.BAD_REQUEST, "TOKEN_USED");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        resetTokenRepository.save(resetToken);

        // Revoke all active sessions
        sessionRepository.findByUserIdAndRevokedFalse(user.getId())
                .forEach(s -> { s.setRevoked(true); s.setRevokedAt(LocalDateTime.now()); });
        log.info("Password reset completed for: {}", user.getEmail());
    }

    @Transactional
    public void verifyEmail(String token) {
        // In production, this would be a real email verification token
        // For now, we just mark the user as verified
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<SessionDto> listActiveSessions() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        return sessionRepository.findByUserIdAndRevokedFalse(user.getId())
                .stream().map(s -> SessionDto.from(s, false)).toList();
    }

    @Transactional
    public void revokeSession(Long sessionId) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        Session s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException("Session not found", HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND"));
        if (!s.getUser().getId().equals(user.getId())) {
            throw new ApiException("Access denied", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
        s.setRevoked(true);
        s.setRevokedAt(LocalDateTime.now());
        sessionRepository.save(s);
    }

    @Transactional
    public void logoutAllDevices() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        sessionRepository.findByUserIdAndRevokedFalse(user.getId())
                .forEach(s -> { s.setRevoked(true); s.setRevokedAt(LocalDateTime.now()); });
    }

    private AuthResponse buildAuthResponse(User user, String deviceId) {
        return buildAuthResponseWithSession(user, deviceId, null, null);
    }

    private AuthResponse buildAuthResponseWithSession(User user, String deviceId, String ipAddress, String userAgent) {
        List<String> roles = List.copyOf(user.getRoles());
        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), roles);
        String refreshJwt = tokenProvider.generateRefreshToken(user.getEmail(), roles);
        // Store a unique opaque token, NOT the JWT (which would be deterministic for same payload)
        String sessionToken = generateSecureToken();

        Session session = Session.builder()
                .user(user)
                .refreshToken(sessionToken)
                .deviceId(deviceId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .createdAt(LocalDateTime.now())
                .lastUsedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        sessionRepository.save(session);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(sessionToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenValiditySeconds())
                .user(UserDto.from(user))
                .build();
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}
