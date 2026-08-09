package com.mtotocare.africa.vaccination;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccinationDto {
    private Long id;
    private Long childId;
    private Long scheduleId;
    private String vaccineCode;
    private String vaccineName;
    private Integer doseNumber;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate administeredAt;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextDoseDue;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate scheduledDate;
    private String administeredBy;
    private String clinicName;
    private String batchNumber;
    private String status;
    private String notes;
    private Boolean overdue;

    public static VaccinationDto from(Vaccination v) {
        return VaccinationDto.builder()
                .id(v.getId())
                .childId(v.getChild() != null ? v.getChild().getId() : null)
                .scheduleId(v.getSchedule() != null ? v.getSchedule().getId() : null)
                .vaccineCode(v.getVaccineCode())
                .vaccineName(v.getVaccineName())
                .doseNumber(v.getDoseNumber())
                .administeredAt(v.getAdministeredAt())
                .nextDoseDue(v.getNextDoseDue())
                .scheduledDate(v.getScheduledDate())
                .administeredBy(v.getAdministeredBy())
                .clinicName(v.getClinicName())
                .batchNumber(v.getBatchNumber())
                .status(v.getStatus())
                .notes(v.getNotes())
                .overdue(v.isOverdue())
                .build();
    }

    public static VaccinationDto from(Vaccination v, VaccinationSchedule s) {
        VaccinationDto dto = from(v);
        if (s != null) {
            dto.setScheduleId(s.getId());
            if (dto.getVaccineName() == null) dto.setVaccineName(s.getVaccineName());
            if (dto.getVaccineCode() == null) dto.setVaccineCode(s.getVaccineCode());
        }
        return dto;
    }
}
