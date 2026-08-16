package com.mtotocare.africa.doctor;

import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.facility.Facility;
import com.mtotocare.africa.user.User;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "license_number", nullable = false, length = 100, unique = true)
    private String licenseNumber;

    @Column(name = "specialization", length = 100)
    private String specialization;

    @Column(name = "sub_specialty", length = 100)
    private String subSpecialty;

    @Column(name = "qualifications", length = 500)
    private String qualifications;

    @Column(name = "languages", length = 200)
    private String languages;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "bio", length = 1000)
    private String bio;

    @Column(name = "accepting_new_patients", nullable = false)
    @Builder.Default
    private Boolean acceptingNewPatients = true;

    @ManyToOne
    @JoinColumn(name = "primary_facility_id")
    private Facility primaryFacility;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    /**
     * Whether an admin has confirmed this doctor's medical license/credentials
     * against the relevant licensing body. Defaults false — accounts start
     * unverified until an admin explicitly verifies them, even though only
     * admins can create clinical-role accounts in the first place.
     */
    @Column(name = "credentials_verified", nullable = false)
    @Builder.Default
    private Boolean credentialsVerified = false;
}
