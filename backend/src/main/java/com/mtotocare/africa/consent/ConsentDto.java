package com.mtotocare.africa.consent;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentDto {
    private Long id;
    private String consentType;
    private String version;
    private Boolean granted;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime grantedAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime revokedAt;
    private String notes;

    public static ConsentDto from(Consent c) {
        return ConsentDto.builder()
                .id(c.getId())
                .consentType(c.getConsentType())
                .version(c.getVersion())
                .granted(c.getGranted())
                .grantedAt(c.getGrantedAt())
                .revokedAt(c.getRevokedAt())
                .notes(c.getNotes())
                .build();
    }
}
