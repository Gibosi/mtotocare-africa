package com.mtotocare.africa.vaccination;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccinationScheduleDto {
    private Long id;
    private String vaccineCode;
    private String vaccineName;
    private String description;
    private Integer recommendedAgeWeeks;
    private Integer dosesRequired;
    private Integer doseNumber;
    private Boolean active;

    public static VaccinationScheduleDto from(VaccinationSchedule s) {
        return VaccinationScheduleDto.builder()
                .id(s.getId())
                .vaccineCode(s.getVaccineCode())
                .vaccineName(s.getVaccineName())
                .description(s.getDescription())
                .recommendedAgeWeeks(s.getRecommendedAgeWeeks())
                .dosesRequired(s.getDosesRequired())
                .doseNumber(s.getDoseNumber())
                .active(s.getActive())
                .build();
    }
}
