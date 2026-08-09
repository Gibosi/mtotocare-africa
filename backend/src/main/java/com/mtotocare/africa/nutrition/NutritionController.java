package com.mtotocare.africa.nutrition;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/nutrition")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService nutritionService;

    /**
     * Generate a new full-day meal plan for a child.
     * Returns a list of meals (BREAKFAST, LUNCH, DINNER, SNACK) for the current day.
     */
    @PostMapping("/child/{childId}/generate")
    public ApiResponse<List<NutritionPlanDto>> generateDaily(@PathVariable Long childId) {
        return ApiResponse.success(
                "Nutrition plan generated",
                nutritionService.generateDaily(childId, LocalDate.now()));
    }

    /**
     * Get today's meal plan for a child. If none exists, generate one automatically.
     */
    @GetMapping("/child/{childId}/daily")
    public ApiResponse<List<NutritionPlanDto>> getDaily(
            @PathVariable Long childId,
            @RequestParam(required = false) String date) {
        LocalDate target = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        return ApiResponse.success(nutritionService.getOrCreateDaily(childId, target));
    }

    /**
     * Get a week's worth of already-generated meal plans starting from
     * startDate (defaults to today).
     */
    @GetMapping("/child/{childId}/weekly")
    public ApiResponse<List<NutritionPlanDto>> getWeekly(
            @PathVariable Long childId,
            @RequestParam(required = false) String startDate) {
        LocalDate start = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : LocalDate.now();
        return ApiResponse.success(nutritionService.getWeekly(childId, start));
    }
}
