package com.mtotocare.africa.security;

import com.mtotocare.africa.auth.Session;
import com.mtotocare.africa.auth.SessionRepository;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = getTokenFromRequest(request);
            if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
                String email = tokenProvider.getEmailFromToken(token);

                // Verify user is still active
                User user = userRepository.findByEmail(email).orElse(null);
                if (user == null || !Boolean.TRUE.equals(user.getActive())) {
                    log.debug("Rejecting token: user {} not found or inactive", email);
                    filterChain.doFilter(request, response);
                    return;
                }

                // Verify the access token has at least one valid (non-revoked, non-expired) session for this user
                // This catches logout-all scenarios where the JWT is still valid but all sessions are revoked
                List<Session> activeSessions = sessionRepository.findByUserIdAndRevokedFalse(user.getId());
                boolean hasValidSession = activeSessions.stream()
                        .anyMatch(s -> s.getExpiresAt().isAfter(LocalDateTime.now()));
                if (!hasValidSession) {
                    log.debug("Rejecting token: no valid session for user {}", email);
                    filterChain.doFilter(request, response);
                    return;
                }

                List<String> roles = tokenProvider.getRolesFromToken(token);
                var authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                request.setAttribute("currentUserEmail", email);
            }
        } catch (Exception ex) {
            log.warn("Could not set user authentication: {}", ex.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
