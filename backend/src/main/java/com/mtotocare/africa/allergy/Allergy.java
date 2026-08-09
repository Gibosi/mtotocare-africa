package com.mtotocare.africa.allergy;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "allergies", indexes = {
    @Index(name = "idx_allergy_child", columnList = "child_id"),
    @Index(name = "idx_allergy_severity", columnList = "severity")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allergy extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnore
    private Child child;

    @Column(name = "allergen", nullable = false, length = 200)
    private String allergen;

    @Column(name = "reaction", length = 500)
    private String reaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", length = 20)
    private Severity severity;

    @Column(name = "diagnosed_at")
    private LocalDate diagnosedAt;

    @Column(name = "notes", length = 1000)
    private String notes;

    public enum Severity { MILD, MODERATE, SEVERE, CRITICAL }
}
