package com.mtotocare.africa.security;

import com.mtotocare.africa.common.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * NFR-002: API responses within 2s for ≥95% of requests.
 * NFR-003: Support 10,000 concurrent users.
 *
 * Simple per-IP token-bucket rate limiter. Anonymous requests (no auth)
 * get a tighter limit; authenticated users get a more generous one.
 *
 * Defaults:
 *   - Anonymous: 60 requests / minute / IP
 *   - Authenticated: 600 requests / minute / user (keyed by email from JWT, or IP if missing)
 *
 * Configure with env vars:
 *   RATE_LIMIT_ANON_RPM (default 60)
 *   RATE_LIMIT_AUTH_RPM (default 600)
 *
 * Registered as a Spring component (auto-detected) and applied to all
 * /api/* requests. Because OncePerRequestFilter is a servlet filter, it
 * runs INSIDE the security chain; the JWT filter (added before the
 * username/password filter) populates SecurityContextHolder so we can
 * read the authenticated user's email here.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long ANON_RPM = parseLong(System.getenv("RATE_LIMIT_ANON_RPM"), 60);
    private static final long AUTH_RPM = parseLong(System.getenv("RATE_LIMIT_AUTH_RPM"), 600);

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Only apply to /api/* (excludes actuator, error pages, static)
        String uri = request.getRequestURI();
        return !uri.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // NFR-002/NFR-003: Per-user/per-IP rate limit using a token bucket.
        String key = bucketKey(request);
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(k.startsWith("auth:") ? AUTH_RPM : ANON_RPM));

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            chain.doFilter(request, response);
        } else {
            long waitMs = probe.getNanosToWaitForRefill() / 1_000_000;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(Math.max(1, waitMs / 1000)));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(), ApiResponse.error(
                    "Too many requests — please slow down. Try again in " +
                            Math.max(1, waitMs / 1000) + "s.",
                    "RATE_LIMITED"));
        }
    }

    private String bucketKey(HttpServletRequest request) {
        // Try the attribute set by JwtAuthenticationFilter first
        String email = (String) request.getAttribute("currentUserEmail");
        if (email == null) {
            // Fall back to Spring Security context (covers the rest of the chain)
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getName() != null
                    && !"anonymousUser".equals(auth.getName())) {
                email = auth.getName();
            }
        }
        if (email != null) {
            return "auth:" + email;
        }
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return "anon:" + xff.split(",")[0].trim();
        }
        return "anon:" + request.getRemoteAddr();
    }

    private static Bucket newBucket(long rpm) {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(rpm, Refill.intervally(rpm, Duration.ofMinutes(1))))
                .build();
    }

    private static long parseLong(String s, long def) {
        if (s == null || s.isBlank()) return def;
        try { return Long.parseLong(s); } catch (NumberFormatException e) { return def; }
    }
}
