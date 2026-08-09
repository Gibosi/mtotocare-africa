package com.mtotocare.africa.vaccination;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "vaccinations", indexes = {
    @Index(name = "idx_vacc_child", columnList = "child_id"),
    @Index(name = "idx_vacc_status", columnList = "status"),
    @Index(name = "idx_vacc_due", columnList = "next_dose_due")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vaccination extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnore
    private Child child;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    @JsonIgnore
    private VaccinationSchedule schedule;

    @Column(name = "vaccine_code", nullable = false, length = 30)
    private String vaccineCode;

    @Column(name = "vaccine_name", nullable = false, length = 150)
    private String vaccineName;

    @Column(name = "dose_number")
    private Integer doseNumber;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "administered_at")
    private LocalDate administeredAt;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "next_dose_due")
    private LocalDate nextDoseDue;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "administered_by", length = 150)
    private String administeredBy;

    @Column(name = "clinic_name", length = 200)
    private String clinicName;

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "notes", length = 1000)
    private String notes;

    @Transient
    public boolean isOverdue() {
        return "PENDING".equals(status) && nextDoseDue != null && nextDoseDue.isBefore(LocalDate.now());
    }
}
