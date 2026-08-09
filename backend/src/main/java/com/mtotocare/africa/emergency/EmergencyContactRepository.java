package com.mtotocare.africa.emergency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByUserIdAndDeletedAtIsNullOrderByPriorityAsc(Long userId);
    List<EmergencyContact> findByUserIdAndIsPrimaryTrueAndDeletedAtIsNull(Long userId);
}
