package com.mtotocare.africa.child;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ChildRequest {
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private Double birthWeightKg;
    private Double birthHeightCm;
}
