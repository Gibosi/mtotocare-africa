package com.mtotocare.africa.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:mtotocare-africa-default-jwt-secret-key-please-change-in-production-32chars-min}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-validity:900000}") // 15 minutes
    private long accessTokenValidity;

    @Value("${app.jwt.refresh-token-validity:604800000}") // 7 days
    private long refreshTokenValidity;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email, List<String> roles) {
        return generateToken(email, roles, accessTokenValidity, "access");
    }

    public String generateRefreshToken(String email, List<String> roles) {
        return generateToken(email, roles, refreshTokenValidity, "refresh");
    }

    private String generateToken(String email, List<String> roles, long validity, String type) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validity);

        return Jwts.builder()
                .setSubject(email)
                .claim("roles", roles)
                .claim("type", type)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return (List<String>) Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("roles");
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT: {}", ex.getMessage());
            return false;
        }
    }

    public long getAccessTokenValiditySeconds() {
        return accessTokenValidity / 1000;
    }
}
