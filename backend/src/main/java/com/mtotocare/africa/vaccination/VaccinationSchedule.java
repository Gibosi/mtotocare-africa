package com.mtotocare.africa.vaccination;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "vaccination_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccinationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vaccine_code", nullable = false, unique = true, length = 30)
    private String vaccineCode;

    @Column(name = "vaccine_name", nullable = false, length = 150)
    private String vaccineName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "recommended_age_weeks", nullable = false)
    private Integer recommendedAgeWeeks;

    @Column(name = "doses_required", nullable = false)
    private Integer dosesRequired;

    @Column(name = "dose_number")
    private Integer doseNumber;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
