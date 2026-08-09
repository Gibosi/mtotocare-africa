package com.mtotocare.africa.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.facility.Facility;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "healthcare_workers", indexes = {
    @Index(name = "idx_hw_user", columnList = "user_id"),
    @Index(name = "idx_hw_role", columnList = "worker_role")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthcareWorker extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "worker_role", nullable = false, length = 30)
    private String workerRole; // DOCTOR, NURSE, MIDWIFE, COMMUNITY_HEALTH_WORKER, NUTRITIONIST, PHARMACIST

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(name = "specialization", length = 100)
    private String specialization;

    @Column(name = "sub_specialty", length = 100)
    private String subSpecialty;

    @Column(name = "qualifications", length = 500)
    private String qualifications;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "languages_spoken", length = 200)
    @Builder.Default
    private String languagesSpoken = "en";

    @Column(name = "service_area", length = 100)
    private String serviceArea; // village/ward/district for CHWs

    @Column(name = "supervisor_id")
    private Long supervisorId;

    @Column(name = "is_on_duty", nullable = false)
    @Builder.Default
    private Boolean isOnDuty = true;

    @Column(name = "accepting_referrals", nullable = false)
    @Builder.Default
    private Boolean acceptingReferrals = true;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private Facility facility;

    @Column(name = "bio", length = 1000)
    private String bio;

    @Column(name = "consultation_fee")
    private Double consultationFee;
}
