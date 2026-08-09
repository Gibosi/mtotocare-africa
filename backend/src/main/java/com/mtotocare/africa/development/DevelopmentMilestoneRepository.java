package com.mtotocare.africa.development;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DevelopmentMilestoneRepository extends JpaRepository<DevelopmentMilestone, Long> {
    List<DevelopmentMilestone> findByChildIdAndDeletedAtIsNullOrderByExpectedDateAsc(Long childId);
    List<DevelopmentMilestone> findByChildIdAndStatusAndDeletedAtIsNull(Long childId, String status);
    long countByChildIdAndStatusAndDeletedAtIsNull(Long childId, String status);
}
