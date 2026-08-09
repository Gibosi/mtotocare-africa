package com.mtotocare.africa.appointment;

import lombok.Data;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    @NotNull
    private Long childId;

    /** Optional - the parent can request a specific doctor. */
    private Long doctorId;

    @NotNull
    private LocalDateTime appointmentDatetime;

    private Integer durationMinutes = 30;
    private String appointmentType;
    private String clinicName;
    private String clinicAddress;
    private String doctorName;
    private String reason;
    private String notes;
}
