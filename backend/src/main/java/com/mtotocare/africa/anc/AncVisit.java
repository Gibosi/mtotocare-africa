package com.mtotocare.africa.anc;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.pregnancy.Pregnancy;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "anc_visits", indexes = {
    @Index(name = "idx_anc_pregnancy", columnList = "pregnancy_id"),
    @Index(name = "idx_anc_date", columnList = "visit_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AncVisit extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pregnancy_id", nullable = false)
    @JsonIgnore
    private Pregnancy pregnancy;

    @Column(name = "visit_type", nullable = false, length = 20)
    private String visitType; // ANC or PNC

    @Column(name = "visit_number", nullable = false)
    private Integer visitNumber; // ANC1, ANC2...ANC8 or PNC1, PNC2...

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "next_visit_date")
    private LocalDate nextVisitDate;

    @Column(name = "gestational_weeks")
    private Integer gestationalWeeks; // for ANC

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Column(name = "hemoglobin_g_dl")
    private Double hemoglobinGdl;

    @Column(name = "fundal_height_cm")
    private Double fundalHeightCm;

    @Column(name = "fetal_heart_rate")
    private Integer fetalHeartRate;

    @Column(name = "fetal_movement")
    private String fetalMovement; // ACTIVE, REDUCED, ABSENT

    @Column(name = "edema")
    @Builder.Default
    private Boolean edema = false;

    @Column(name = "proteinuria")
    @Builder.Default
    private Boolean proteinuria = false;

    @Column(name = "urine_glucose")
    private String urineGlucose; // NEGATIVE, TRACE, POSITIVE

    @Column(name = "iron_folic_given", nullable = false)
    @Builder.Default
    private Boolean ironFolicGiven = false;

    @Column(name = "tt_vaccine_given")
    @Builder.Default
    private Boolean ttVaccineGiven = false;

    @Column(name = "ipt_given", nullable = false)
    @Builder.Default
    private Boolean iptGiven = false; // intermittent preventive treatment for malaria

    @Column(name = "deworming_given", nullable = false)
    @Builder.Default
    private Boolean dewormingGiven = false;

    @Column(name = "hiv_test_done", nullable = false)
    @Builder.Default
    private Boolean hivTestDone = false;

    @Column(name = "hiv_result")
    private String hivResult;

    @Column(name = "syphilis_test_done", nullable = false)
    @Builder.Default
    private Boolean syphilisTestDone = false;

    @Column(name = "syphilis_result")
    private String syphilisResult;

    @Column(name = "ultrasound_done", nullable = false)
    @Builder.Default
    private Boolean ultrasoundDone = false;

    @Column(name = "ultrasound_findings", length = 1000)
    private String ultrasoundFindings;

    @Column(name = "complications", length = 1000)
    private String complications;

    @Column(name = "referred", nullable = false)
    @Builder.Default
    private Boolean referred = false;

    @Column(name = "referral_reason", length = 500)
    private String referralReason;

    @Column(name = "health_facility", length = 200)
    private String healthFacility;

    @Column(name = "attended_by", length = 200)
    private String attendedBy;

    @Column(name = "notes", length = 1000)
    private String notes;
}
