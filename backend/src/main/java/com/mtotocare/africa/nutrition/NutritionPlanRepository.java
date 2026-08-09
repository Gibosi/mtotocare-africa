package com.mtotocare.africa.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long> {
    List<NutritionPlan> findByChildIdAndActiveTrue(Long childId);
    Optional<NutritionPlan> findFirstByChildIdAndActiveTrueOrderByCreatedAtDesc(Long childId);
    long countByChildId(Long childId);
    List<NutritionPlan> findByChildIdAndPlanDateBetweenOrderByPlanDateAsc(Long childId, java.time.LocalDate start, java.time.LocalDate end);
}
