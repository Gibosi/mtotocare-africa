package com.mtotocare.africa.growth;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrowthDto {
    private Long id;
    private Long childId;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate measurementDate;
    private Integer ageInDays;
    private Double weightKg;
    private Double heightCm;
    private Double headCircumferenceCm;
    private Double muacCm;
    private Double bmi;

    // WHO Child Growth Standards Z-scores
    private Double weightForAgeZ;
    private Double heightForAgeZ;
    private Double weightForHeightZ;
    private Double bmiForAgeZ;

    // Assessment
    private String nutritionStatus;
    private String riskLevel;
    private Integer healthScore;
    private String growthTrend;
    private Boolean referralRecommended;
    private Boolean emergencyFlag;
    private Boolean oedema;
    private Boolean severeDehydration;
    private String aiSummary;

    private String notes;

    public static GrowthDto from(GrowthRecord r) {
        return GrowthDto.builder()
                .id(r.getId())
                .childId(r.getChild() != null ? r.getChild().getId() : null)
                .measurementDate(r.getMeasurementDate())
                .ageInDays(r.getAgeInDays())
                .weightKg(r.getWeightKg())
                .heightCm(r.getHeightCm())
                .headCircumferenceCm(r.getHeadCircumferenceCm())
                .muacCm(r.getMuacCm())
                .bmi(r.getBmi())
                .weightForAgeZ(r.getWeightForAgeZ())
                .heightForAgeZ(r.getHeightForAgeZ())
                .weightForHeightZ(r.getWeightForHeightZ())
                .bmiForAgeZ(r.getBmiForAgeZ())
                .nutritionStatus(r.getNutritionStatus())
                .riskLevel(r.getRiskLevel())
                .healthScore(r.getHealthScore())
                .growthTrend(r.getGrowthTrend())
                .referralRecommended(r.getReferralRecommended())
                .emergencyFlag(r.getEmergencyFlag())
                .oedema(r.getOedema())
                .severeDehydration(r.getSevereDehydration())
                .aiSummary(r.getAiSummary())
                .notes(r.getNotes())
                .build();
    }
}
