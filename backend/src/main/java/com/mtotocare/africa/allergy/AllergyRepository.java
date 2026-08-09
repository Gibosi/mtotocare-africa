package com.mtotocare.africa.allergy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {
    List<Allergy> findByChildIdOrderByDiagnosedAtDesc(Long childId);
    List<Allergy> findByChildIdAndSeverityIn(Long childId, List<Allergy.Severity> severities);
}
