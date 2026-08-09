package com.mtotocare.africa.child;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.user.User;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.Period;

@Entity
@Table(name = "children", indexes = {
    @Index(name = "idx_child_parent", columnList = "parent_id"),
    @Index(name = "idx_child_dob", columnList = "date_of_birth")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Child extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "gender", nullable = false, length = 10)
    private String gender;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(name = "birth_weight_kg")
    private Double birthWeightKg;

    @Column(name = "birth_height_cm")
    private Double birthHeightCm;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Column(name = "national_id", length = 50)
    private String nationalId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    @JsonIgnore
    private User parent;

    // Transient helpers
    @Transient
    public String getFullName() {
        if (lastName == null || lastName.isBlank()) return firstName;
        return firstName + " " + lastName;
    }

    @Transient
    public Integer getAgeInMonths() {
        if (dateOfBirth == null) return null;
        LocalDate now = LocalDate.now();
        return Period.between(dateOfBirth, now).getYears() * 12 + Period.between(dateOfBirth, now).getMonths();
    }

    @Transient
    public Integer getAgeInYears() {
        if (dateOfBirth == null) return null;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
}
