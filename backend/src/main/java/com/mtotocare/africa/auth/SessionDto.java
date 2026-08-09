package com.mtotocare.africa.auth;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionDto {
    private Long id;
    private String deviceId;
    private String ipAddress;
    private String userAgent;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastUsedAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt;
    private Boolean current;

    public static SessionDto from(Session s, boolean current) {
        return SessionDto.builder()
                .id(s.getId())
                .deviceId(s.getDeviceId())
                .ipAddress(s.getIpAddress())
                .userAgent(s.getUserAgent())
                .createdAt(s.getCreatedAt())
                .lastUsedAt(s.getLastUsedAt())
                .expiresAt(s.getExpiresAt())
                .current(current)
                .build();
    }
}
