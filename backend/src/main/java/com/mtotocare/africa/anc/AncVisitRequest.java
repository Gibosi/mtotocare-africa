package com.mtotocare.africa.anc;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class AncVisitRequest {
    @NotNull
    private String visitType; // ANC or PNC
    @NotNull
    private Integer visitNumber;
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate visitDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextVisitDate;
    private Integer gestationalWeeks;
    private Double weightKg;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Double hemoglobinGdl;
    private Double fundalHeightCm;
    private Integer fetalHeartRate;
    private String fetalMovement;
    private Boolean edema;
    private Boolean proteinuria;
    private String urineGlucose;
    private Boolean ironFolicGiven;
    private Boolean ttVaccineGiven;
    private Boolean iptGiven;
    private Boolean dewormingGiven;
    private Boolean hivTestDone;
    private String hivResult;
    private Boolean syphilisTestDone;
    private String syphilisResult;
    private Boolean ultrasoundDone;
    private String ultrasoundFindings;
    private String complications;
    private Boolean referred;
    private String referralReason;
    private String healthFacility;
    private String attendedBy;
    private String notes;
}
