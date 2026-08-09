package com.mtotocare.africa.anc;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AncVisitRepository extends JpaRepository<AncVisit, Long> {
    List<AncVisit> findByPregnancyIdAndDeletedAtIsNullOrderByVisitDateAsc(Long pregnancyId);
    List<AncVisit> findByPregnancyIdAndVisitTypeAndDeletedAtIsNullOrderByVisitNumberAsc(Long pregnancyId, String visitType);
    long countByPregnancyIdAndVisitTypeAndDeletedAtIsNull(Long pregnancyId, String visitType);
}
