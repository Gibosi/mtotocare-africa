package com.mtotocare.africa.anc;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AncVisitDto {
    private Long id;
    private Long pregnancyId;
    private String visitType;
    private Integer visitNumber;
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

    public static AncVisitDto from(AncVisit v) {
        return AncVisitDto.builder()
                .id(v.getId())
                .pregnancyId(v.getPregnancy() != null ? v.getPregnancy().getId() : null)
                .visitType(v.getVisitType())
                .visitNumber(v.getVisitNumber())
                .visitDate(v.getVisitDate())
                .nextVisitDate(v.getNextVisitDate())
                .gestationalWeeks(v.getGestationalWeeks())
                .weightKg(v.getWeightKg())
                .bloodPressureSystolic(v.getBloodPressureSystolic())
                .bloodPressureDiastolic(v.getBloodPressureDiastolic())
                .hemoglobinGdl(v.getHemoglobinGdl())
                .fundalHeightCm(v.getFundalHeightCm())
                .fetalHeartRate(v.getFetalHeartRate())
                .fetalMovement(v.getFetalMovement())
                .edema(v.getEdema())
                .proteinuria(v.getProteinuria())
                .urineGlucose(v.getUrineGlucose())
                .ironFolicGiven(v.getIronFolicGiven())
                .ttVaccineGiven(v.getTtVaccineGiven())
                .iptGiven(v.getIptGiven())
                .dewormingGiven(v.getDewormingGiven())
                .hivTestDone(v.getHivTestDone())
                .hivResult(v.getHivResult())
                .syphilisTestDone(v.getSyphilisTestDone())
                .syphilisResult(v.getSyphilisResult())
                .ultrasoundDone(v.getUltrasoundDone())
                .ultrasoundFindings(v.getUltrasoundFindings())
                .complications(v.getComplications())
                .referred(v.getReferred())
                .referralReason(v.getReferralReason())
                .healthFacility(v.getHealthFacility())
                .attendedBy(v.getAttendedBy())
                .notes(v.getNotes())
                .build();
    }
}
