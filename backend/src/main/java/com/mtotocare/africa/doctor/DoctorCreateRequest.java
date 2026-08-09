package com.mtotocare.africa.doctor;

import lombok.Data;

@Data
public class DoctorCreateRequest {
    private String email;
    private String licenseNumber;
    private String specialization;
    private String subSpecialty;
    private String qualifications;
    private String languages;
    private Integer yearsOfExperience;
    private String bio;
    private Double consultationFee;
}
