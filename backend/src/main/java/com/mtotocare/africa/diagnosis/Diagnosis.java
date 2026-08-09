package com.mtotocare.africa.diagnosis;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "diagnoses", indexes = {
    @Index(name = "idx_diag_child", columnList = "child_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Diagnosis extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnore
    private Child child;

    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(name = "doctor_name", length = 200)
    private String doctorName;

    @Column(name = "condition_name", nullable = false, length = 200)
    private String condition;

    @Column(name = "diagnosis_code", length = 50)
    private String diagnosisCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private Severity severity;

    @Column(name = "diagnosed_at")
    private LocalDate diagnosedAt;

    @Column(name = "treatment_plan", length = 2000)
    private String treatmentPlan;

    @Column(name = "notes", length = 2000)
    private String notes;

    public enum Severity { MILD, MODERATE, SEVERE }
}
