package com.mtotocare.africa.medication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findByChildId(Long childId);
    List<Medication> findByChildIdAndActive(Long childId, Boolean active);
}
