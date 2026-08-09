package com.mtotocare.africa.child;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChildDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    private Integer ageInMonths;
    private Integer ageInYears;
    private String gender;
    private String bloodGroup;
    private Double birthWeightKg;
    private Double birthHeightCm;
    private String profilePictureUrl;

    public static ChildDto from(Child child) {
        return ChildDto.builder()
                .id(child.getId())
                .firstName(child.getFirstName())
                .lastName(child.getLastName())
                .fullName(child.getFullName())
                .dateOfBirth(child.getDateOfBirth())
                .ageInMonths(child.getAgeInMonths())
                .ageInYears(child.getAgeInYears())
                .gender(child.getGender())
                .bloodGroup(child.getBloodGroup())
                .birthWeightKg(child.getBirthWeightKg())
                .birthHeightCm(child.getBirthHeightCm())
                .profilePictureUrl(child.getProfilePictureUrl())
                .build();
    }
}
