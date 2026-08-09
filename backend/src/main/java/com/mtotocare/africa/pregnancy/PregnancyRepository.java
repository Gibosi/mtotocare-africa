package com.mtotocare.africa.pregnancy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PregnancyRepository extends JpaRepository<Pregnancy, Long> {
    List<Pregnancy> findByMotherIdAndDeletedAtIsNullOrderByLastMenstrualPeriodDesc(Long motherId);
    Optional<Pregnancy> findFirstByMotherIdAndStatusAndDeletedAtIsNullOrderByLastMenstrualPeriodDesc(Long motherId, String status);
    List<Pregnancy> findByStatusAndDeletedAtIsNull(String status);
    long countByMotherIdAndStatusAndDeletedAtIsNull(Long motherId, String status);
}
