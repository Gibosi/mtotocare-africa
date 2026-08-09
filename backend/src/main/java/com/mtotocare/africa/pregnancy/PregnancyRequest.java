package com.mtotocare.africa.pregnancy;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class PregnancyRequest {
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastMenstrualPeriod;

    private Integer gravida;
    private Integer para;
    private Integer miscarriages;
    private String bloodGroup;
    private String rhFactor;
    private Double weightKgPrePregnancy;
    private Double heightCm;
    private String riskFactors;
    private String notes;
}
