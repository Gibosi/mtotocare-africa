package com.mtotocare.africa.auth;

import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * Generates, stores, and verifies 6-digit OTPs for phone numbers.
 * Implements FR-003: "The system shall verify phone numbers using a
 * one-time password (OTP)."
 *
 * In production this should dispatch via Africa's Talking or Twilio;
 * for now the code is logged and (in dev/sandbox) returned in the API
 * response so the mobile client can complete the flow.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PhoneOtpService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int CODE_LENGTH = 6;
    private static final int TTL_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    private final PhoneOtpTokenRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public String requestOtp(String phoneNumber) {
        // Invalidate any previous unused OTPs for this phone
        repository.findAll().stream()
                .filter(o -> o.getPhoneNumber().equals(phoneNumber) && !o.isUsed())
                .forEach(o -> {
                    o.setUsedAt(LocalDateTime.now());
                    repository.save(o);
                });

        String code = generateCode();
        PhoneOtpToken token = PhoneOtpToken.builder()
                .phoneNumber(phoneNumber)
                .code(code)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(TTL_MINUTES))
                .attempts(0)
                .build();
        repository.save(token);

        // TODO: integrate SMS gateway (Africa's Talking, Twilio) and dispatch.
        // For now, log so it shows up in Render logs.
        log.info("[SMS-GATEWAY-STUB] OTP for {} = {} (valid {} min)", phoneNumber, code, TTL_MINUTES);
        return code;
    }

    @Transactional
    public void verifyOtp(String phoneNumber, String code) {
        PhoneOtpToken token = repository.findLatestValid(phoneNumber, code)
                .orElseThrow(() -> new ApiException(
                        "Invalid or expired OTP",
                        HttpStatus.BAD_REQUEST, "INVALID_OTP"));

        if (token.isExpired()) {
            throw new ApiException("OTP expired — please request a new one",
                    HttpStatus.BAD_REQUEST, "OTP_EXPIRED");
        }
        if (token.getAttempts() >= MAX_ATTEMPTS) {
            throw new ApiException("Too many failed attempts — please request a new OTP",
                    HttpStatus.TOO_MANY_REQUESTS, "OTP_LOCKED");
        }
        if (token.isUsed()) {
            throw new ApiException("This OTP has already been used",
                    HttpStatus.BAD_REQUEST, "OTP_USED");
        }

        token.setUsedAt(LocalDateTime.now());
        repository.save(token);

        // Mark the user's phone as verified (if a user has this phone)
        userRepository.findByPhoneNumber(phoneNumber).ifPresent(user -> {
            user.setPhoneVerified(true);
            userRepository.save(user);
            log.info("Phone verified for user: {}", user.getEmail());
        });
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}
