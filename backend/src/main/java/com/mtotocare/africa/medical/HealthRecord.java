package com.mtotocare.africa.medical;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "health_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnore
    private Child child;

    @Column(name = "record_type", nullable = false, length = 50)
    private String recordType;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "doctor_name", length = 200)
    private String doctorName;

    @Column(name = "clinic_name", length = 200)
    private String clinicName;

    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @Column(name = "severity", length = 30)
    private String severity;
}
