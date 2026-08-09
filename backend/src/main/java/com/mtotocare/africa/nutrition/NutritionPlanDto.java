package com.mtotocare.africa.nutrition;

import com.mtotocare.africa.child.Child;
import lombok.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionPlanDto {
    private Long id;
    private Long childId;
    private String childName;
    private LocalDate planDate;
    private String mealType;     // BREAKFAST, LUNCH, DINNER, SNACK
    private String title;
    private String description;
    private List<String> ingredients;
    private Integer caloriesKcal;
    private Boolean ageAppropriate;
    private String feedingFrequency;
    private String foodsToAvoid;

    public static NutritionPlanDto from(Child child, LocalDate date, String mealType,
                                        String title, String description, String ingredientsCsv,
                                        int calories, String frequency, String avoid) {
        List<String> ings = (ingredientsCsv == null || ingredientsCsv.isBlank())
                ? Collections.emptyList()
                : Arrays.stream(ingredientsCsv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());

        return NutritionPlanDto.builder()
                .childId(child != null ? child.getId() : null)
                .childName(child != null ? child.getFullName() : null)
                .planDate(date)
                .mealType(mealType)
                .title(title)
                .description(description)
                .ingredients(ings)
                .caloriesKcal(calories)
                .ageAppropriate(true)
                .feedingFrequency(frequency)
                .foodsToAvoid(avoid)
                .build();
    }
}
