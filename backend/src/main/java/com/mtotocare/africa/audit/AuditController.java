package com.mtotocare.africa.audit;

import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Top-level /audit endpoint for the web admin "View Audit" page.
 * The frontend calls GET /audit (not /admin/audit-logs).
 */
@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<Map<String, Object>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search) {
        return ApiResponse.success(auditService.list(page, size, search));
    }
}
