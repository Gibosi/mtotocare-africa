package com.mtotocare.africa.medication;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MedicationRequest {
    private String name;
    private String dosage;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private String prescribedBy;
    private Boolean active;
    private String notes;
}
