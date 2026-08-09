package com.mtotocare.africa.allergy;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AllergyRequest {
    private String allergen;
    private String reaction;
    private Allergy.Severity severity;
    private LocalDate diagnosedAt;
    private String notes;
}
