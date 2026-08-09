package com.mtotocare.africa.medication;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationDto {
    private Long id;
    private Long childId;
    private String name;
    private String dosage;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private String prescribedBy;
    private Boolean active;
    private String notes;

    public static MedicationDto from(Medication m) {
        return MedicationDto.builder()
            .id(m.getId())
            .childId(m.getChild() != null ? m.getChild().getId() : null)
            .name(m.getName())
            .dosage(m.getDosage())
            .frequency(m.getFrequency())
            .startDate(m.getStartDate())
            .endDate(m.getEndDate())
            .prescribedBy(m.getPrescribedBy())
            .active(m.getActive())
            .notes(m.getNotes())
            .build();
    }
}
