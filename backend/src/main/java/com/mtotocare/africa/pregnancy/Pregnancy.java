package com.mtotocare.africa.pregnancy;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.user.User;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pregnancies", indexes = {
    @Index(name = "idx_preg_mother", columnList = "mother_id"),
    @Index(name = "idx_preg_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pregnancy extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mother_id", nullable = false)
    @JsonIgnore
    private User mother;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "last_menstrual_period", nullable = false)
    private LocalDate lastMenstrualPeriod;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "expected_due_date", nullable = false)
    private LocalDate expectedDueDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "conception_date")
    private LocalDate conceptionDate;

    @Column(name = "gravida")
    private Integer gravida; // total pregnancies

    @Column(name = "para")
    private Integer para; // live births

    @Column(name = "miscarriages")
    private Integer miscarriages;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(name = "rh_factor", length = 10)
    private String rhFactor;

    @Column(name = "weight_kg_pre_pregnancy")
    private Double weightKgPrePregnancy;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "high_risk", nullable = false)
    @Builder.Default
    private Boolean highRisk = false;

    @Column(name = "risk_factors", length = 1000)
    private String riskFactors; // comma-sep: "diabetes,hypertension,age>35"

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, DELIVERED, MISCARRIED, TERMINATED

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "delivery_type", length = 30)
    private String deliveryType; // VAGINAL, C_SECTION, VACUUM

    @Column(name = "delivery_outcome", length = 30)
    private String deliveryOutcome; // LIVE_BIRTH, STILLBIRTH

    @Column(name = "baby_gender", length = 10)
    private String babyGender;

    @Column(name = "baby_weight_kg")
    private Double babyWeightKg;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Transient
    public Integer getCurrentWeek() {
        if (lastMenstrualPeriod == null) return null;
        long days = java.time.temporal.ChronoUnit.DAYS.between(lastMenstrualPeriod, LocalDate.now());
        return (int) (days / 7);
    }

    @Transient
    public Integer getTrimester() {
        Integer week = getCurrentWeek();
        if (week == null) return null;
        if (week < 13) return 1;
        if (week < 27) return 2;
        return 3;
    }

    @Transient
    public Long getDaysUntilDue() {
        if (expectedDueDate == null) return null;
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expectedDueDate);
    }
}
