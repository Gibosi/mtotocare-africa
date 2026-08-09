package com.mtotocare.africa.consent;

import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsentService {

    public static final List<String> VALID_TYPES = List.of(
        "TERMS_OF_SERVICE", "PRIVACY_POLICY", "DATA_PROCESSING", "MARKETING_EMAILS",
        "PUSH_NOTIFICATIONS", "AI_ASSISTANT", "DATA_SHARING_RESEARCH", "CHILD_DATA_PROCESSING"
    );

    private final ConsentRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public ConsentDto record(ConsentRequest request, String ipAddress, String userAgent) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));

        if (!VALID_TYPES.contains(request.getConsentType())) {
            throw new ApiException("Invalid consent type", HttpStatus.BAD_REQUEST, "INVALID_CONSENT_TYPE");
        }

        Consent consent = repository.findByUserIdAndConsentTypeAndDeletedAtIsNull(user.getId(), request.getConsentType())
                .orElseGet(() -> Consent.builder().user(user).consentType(request.getConsentType()).build());

        consent.setGranted(request.getGranted());
        consent.setVersion(request.getVersion());
        consent.setIpAddress(ipAddress);
        consent.setUserAgent(userAgent);
        consent.setNotes(request.getNotes());

        if (request.getGranted()) {
            consent.setGrantedAt(LocalDateTime.now());
            consent.setRevokedAt(null);
        } else {
            consent.setRevokedAt(LocalDateTime.now());
        }

        return ConsentDto.from(repository.save(consent));
    }

    @Transactional(readOnly = true)
    public List<ConsentDto> list() {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
        return repository.findByUserIdAndDeletedAtIsNull(user.getId())
                .stream().map(ConsentDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isConsented(String userEmail, String consentType) {
        return userRepository.findByEmail(userEmail)
                .flatMap(u -> repository.findByUserIdAndConsentTypeAndDeletedAtIsNull(u.getId(), consentType))
                .map(Consent::getGranted)
                .orElse(false);
    }
}
