package com.mtotocare.africa.appointment;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.doctor.Doctor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {
    private Long id;
    private Long childId;
    private String childName;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDateTime appointmentDatetime;
    private Integer durationMinutes;
    private String appointmentType;
    private String clinicName;
    private String clinicAddress;
    private String reason;
    private String notes;
    private String status;
    private String cancellationReason;
    private String createdAt;

    public static AppointmentDto from(Appointment a) {
        Child c = a.getChild();
        Doctor d = a.getDoctor();
        return AppointmentDto.builder()
            .id(a.getId())
            .childId(c != null ? c.getId() : null)
            .childName(c != null ? c.getFullName() : null)
            .doctorId(d != null ? d.getId() : null)
            .doctorName(d != null && d.getUser() != null ? d.getUser().getFullName() : a.getDoctorName())
            .doctorSpecialization(d != null ? d.getSpecialization() : null)
            .appointmentDatetime(a.getAppointmentDatetime())
            .durationMinutes(a.getDurationMinutes())
            .appointmentType(a.getAppointmentType())
            .clinicName(a.getClinicName())
            .clinicAddress(a.getClinicAddress())
            .reason(a.getReason())
            .notes(a.getNotes())
            .status(a.getStatus())
            .cancellationReason(a.getCancellationReason())
            .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
            .build();
    }
}
