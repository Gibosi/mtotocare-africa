package com.mtotocare.africa.user;

import com.mtotocare.africa.facility.Facility;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthcareWorkerDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String workerRole;
    private String licenseNumber;
    private String specialization;
    private String subSpecialty;
    private String qualifications;
    private Integer yearsOfExperience;
    private String languagesSpoken;
    private String serviceArea;
    private Boolean isOnDuty;
    private Boolean acceptingReferrals;
    private Long facilityId;
    private String facilityName;
    private String bio;
    private Double consultationFee;

    public static HealthcareWorkerDto from(HealthcareWorker w) {
        Facility f = w.getFacility();
        User u = w.getUser();
        return HealthcareWorkerDto.builder()
                .id(w.getId())
                .fullName(u != null ? u.getFullName() : null)
                .email(u != null ? u.getEmail() : null)
                .phoneNumber(u != null ? u.getPhoneNumber() : null)
                .workerRole(w.getWorkerRole())
                .licenseNumber(w.getLicenseNumber())
                .specialization(w.getSpecialization())
                .subSpecialty(w.getSubSpecialty())
                .qualifications(w.getQualifications())
                .yearsOfExperience(w.getYearsOfExperience())
                .languagesSpoken(w.getLanguagesSpoken())
                .serviceArea(w.getServiceArea())
                .isOnDuty(w.getIsOnDuty())
                .acceptingReferrals(w.getAcceptingReferrals())
                .facilityId(f != null ? f.getId() : null)
                .facilityName(f != null ? f.getName() : null)
                .bio(w.getBio())
                .consultationFee(w.getConsultationFee())
                .build();
    }
}
