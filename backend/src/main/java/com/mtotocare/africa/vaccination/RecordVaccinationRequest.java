package com.mtotocare.africa.vaccination;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RecordVaccinationRequest {
    private Long scheduleId;
    private LocalDate administeredAt;
    private LocalDate nextDoseDue;
    private String clinicName;
    private String batchNumber;
    private String notes;
}
