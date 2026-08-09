package com.mtotocare.africa.diagnosis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisDto {
    private Long id;
    private Long childId;
    private Long doctorId;
    private String doctorName;
    private String condition;
    private String diagnosisCode;
    private Diagnosis.Severity severity;
    private LocalDate diagnosedAt;
    private String treatmentPlan;
    private String notes;

    public static DiagnosisDto from(Diagnosis d) {
        if (d == null) return null;
        return DiagnosisDto.builder()
                .id(d.getId())
                .childId(d.getChild() != null ? d.getChild().getId() : null)
                .doctorId(d.getDoctorId())
                .doctorName(d.getDoctorName())
                .condition(d.getCondition())
                .diagnosisCode(d.getDiagnosisCode())
                .severity(d.getSeverity())
                .diagnosedAt(d.getDiagnosedAt())
                .treatmentPlan(d.getTreatmentPlan())
                .notes(d.getNotes())
                .build();
    }
}
