package com.mtotocare.africa.development;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "development_milestones", indexes = {
    @Index(name = "idx_devmilestone_child", columnList = "child_id"),
    @Index(name = "idx_devmilestone_category", columnList = "category"),
    @Index(name = "idx_devmilestone_age", columnList = "expected_age_months")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DevelopmentMilestone extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnore
    private Child child;

    @Column(name = "category", nullable = false, length = 30)
    private String category; // MOTOR_FINE, MOTOR_GROSS, LANGUAGE, COGNITIVE, SOCIAL, EMOTIONAL

    @Column(name = "milestone_code", length = 50)
    private String milestoneCode; // e.g. "SMILE_2M", "WALK_12M"

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "expected_age_months", nullable = false)
    private Integer expectedAgeMonths;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "achieved_date")
    private LocalDate achievedDate;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACHIEVED, DELAYED, NOT_ACHIEVED

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;
}
