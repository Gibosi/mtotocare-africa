package com.mtotocare.africa.nutrition;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "nutrition_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnore
    private Child child;

    @Column(name = "age_range", length = 50)
    private String ageRange;

    @Column(name = "plan_date")
    private LocalDate planDate;

    @Column(name = "meal_type", length = 50)
    private String mealType;

    @Column(name = "meal_name", length = 200)
    private String mealName;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "calories_kcal")
    private Integer caloriesKcal;

    @Column(name = "recommendations", length = 3000)
    private String recommendations;

    @Column(name = "foods_to_include", length = 2000)
    private String foodsToInclude;

    @Column(name = "foods_to_avoid", length = 2000)
    private String foodsToAvoid;

    @Column(name = "feeding_frequency", length = 200)
    private String feedingFrequency;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
