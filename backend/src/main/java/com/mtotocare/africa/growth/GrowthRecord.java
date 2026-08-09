package com.mtotocare.africa.growth;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "growth_records", indexes = {
    @Index(name = "idx_growth_child", columnList = "child_id"),
    @Index(name = "idx_growth_date", columnList = "measurement_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrowthRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnore
    private Child child;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "measurement_date", nullable = false)
    private LocalDate measurementDate;

    @Column(name = "age_in_days")
    private Integer ageInDays;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "head_circumference_cm")
    private Double headCircumferenceCm;

    @Column(name = "muac_cm")
    private Double muacCm;

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "weight_for_age_z_score")
    private Double weightForAgeZ;

    @Column(name = "height_for_age_z_score")
    private Double heightForAgeZ;

    @Column(name = "weight_for_height_z_score")
    private Double weightForHeightZ;

    @Column(name = "bmi_for_age_z_score")
    private Double bmiForAgeZ;

    @Column(name = "nutrition_status", length = 50)
    private String nutritionStatus;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    @Column(name = "health_score")
    private Integer healthScore;

    @Column(name = "growth_trend", length = 20)
    private String growthTrend;

    @Column(name = "referral_recommended", nullable = false)
    @Builder.Default
    private Boolean referralRecommended = false;

    @Column(name = "emergency_flag", nullable = false)
    @Builder.Default
    private Boolean emergencyFlag = false;

    @Column(name = "oedema", nullable = false)
    @Builder.Default
    private Boolean oedema = false;

    @Column(name = "severe_dehydration", nullable = false)
    @Builder.Default
    private Boolean severeDehydration = false;

    @Column(name = "ai_summary", length = 2000)
    private String aiSummary;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "recorded_by", length = 200)
    private String recordedBy;
}
