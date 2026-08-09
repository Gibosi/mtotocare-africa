package com.mtotocare.africa.audit;

import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.common.PageResponse;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * Service for recording and retrieving audit log entries.
 * Implements NFR-023 (audit log of security actions) and
 * NFR-067 (audit trails for clinical/admin activities).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public AuditLog record(String action, String entityType, Long entityId, String details, HttpServletRequest http) {
        String email = SecurityUtils.getCurrentUserEmail();
        Long userId = null;
        if (email != null) {
            userId = userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        String ip = http != null ? http.getRemoteAddr() : null;
        AuditLog entry = AuditLog.builder()
                .userEmail(email)
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ip)
                .build();
        AuditLog saved = repository.save(entry);
        log.info("[AUDIT] {} by {} (id={}) on {}#{} - {}",
                action, email, userId, entityType, entityId, details);
        return saved;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<Map<String, Object>> list(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<AuditLog> result;
        if (search != null && !search.isBlank()) {
            result = repository.findByUserEmailContainingIgnoreCaseOrderByIdDesc(search, pageable);
        } else {
            result = repository.findAllByOrderByIdDesc(pageable);
        }
        List<Map<String, Object>> content = result.getContent().stream()
                .map(this::toMap)
                .toList();
        return new PageResponse<>(content, (int) result.getTotalElements(),
                result.getTotalPages(), (int) result.getSize(), (int) result.getNumber());
    }

    private Map<String, Object> toMap(AuditLog l) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id", l.getId());
        m.put("userId", l.getUserId());
        m.put("userEmail", l.getUserEmail());
        m.put("action", l.getAction());
        m.put("entityType", l.getEntityType());
        m.put("entityId", l.getEntityId());
        m.put("details", l.getDetails());
        m.put("ipAddress", l.getIpAddress());
        m.put("createdAt", l.getCreatedAt() != null ? l.getCreatedAt().toString() : null);
        return m;
    }
}
