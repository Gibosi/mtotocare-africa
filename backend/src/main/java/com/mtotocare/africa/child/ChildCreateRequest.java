package com.mtotocare.africa.child;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Past;
import java.time.LocalDate;

@Data
public class ChildCreateRequest {
    @NotBlank
    private String firstName;
    private String lastName;

    @NotNull
    @Past
    private LocalDate dateOfBirth;

    @NotBlank
    private String gender;
    private String bloodGroup;
    private Double birthWeightKg;
    private Double birthHeightCm;
}
