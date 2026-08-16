package com.mtotocare.africa.doctor;

import com.mtotocare.africa.facility.Facility;
import com.mtotocare.africa.user.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String profilePictureUrl;
    private String licenseNumber;
    private String specialization;
    private String subSpecialty;
    private String qualifications;
    private String languages;
    private Integer yearsOfExperience;
    private String bio;
    private Boolean acceptingNewPatients;
    private Long facilityId;
    private String facilityName;
    private Double consultationFee;
    private Boolean credentialsVerified;

    public static DoctorDto from(Doctor d) {
        User u = d.getUser();
        Facility f = d.getPrimaryFacility();
        return DoctorDto.builder()
            .id(d.getId())
            .userId(u != null ? u.getId() : null)
            .fullName(u != null ? u.getFullName() : null)
            .email(u != null ? u.getEmail() : null)
            .phoneNumber(u != null ? u.getPhoneNumber() : null)
            .profilePictureUrl(u != null ? u.getProfilePictureUrl() : null)
            .licenseNumber(d.getLicenseNumber())
            .specialization(d.getSpecialization())
            .subSpecialty(d.getSubSpecialty())
            .qualifications(d.getQualifications())
            .languages(d.getLanguages())
            .yearsOfExperience(d.getYearsOfExperience())
            .bio(d.getBio())
            .acceptingNewPatients(d.getAcceptingNewPatients())
            .facilityId(f != null ? f.getId() : null)
            .facilityName(f != null ? f.getName() : null)
            .consultationFee(d.getConsultationFee())
            .credentialsVerified(d.getCredentialsVerified())
            .build();
    }

    /** Alias of acceptingNewPatients (the doctor is "on duty" when they accept new patients). */
    public Boolean getIsOnDuty() {
        return acceptingNewPatients;
    }
    public void setIsOnDuty(Boolean v) {
        this.acceptingNewPatients = v;
    }
}
