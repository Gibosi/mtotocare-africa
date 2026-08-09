package com.mtotocare.africa.growth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrowthRepository extends JpaRepository<GrowthRecord, Long> {
    List<GrowthRecord> findByChildIdOrderByMeasurementDateDesc(Long childId);
    Optional<GrowthRecord> findFirstByChildIdOrderByMeasurementDateDesc(Long childId);
}
