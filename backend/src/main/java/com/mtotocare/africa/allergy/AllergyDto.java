package com.mtotocare.africa.allergy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllergyDto {
    private Long id;
    private Long childId;
    private String allergen;
    private String reaction;
    private Allergy.Severity severity;
    private LocalDate diagnosedAt;
    private String notes;

    public static AllergyDto from(Allergy a) {
        if (a == null) return null;
        return AllergyDto.builder()
                .id(a.getId())
                .childId(a.getChild() != null ? a.getChild().getId() : null)
                .allergen(a.getAllergen())
                .reaction(a.getReaction())
                .severity(a.getSeverity())
                .diagnosedAt(a.getDiagnosedAt())
                .notes(a.getNotes())
                .build();
    }
}
