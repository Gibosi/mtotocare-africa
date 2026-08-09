package com.mtotocare.africa.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthcareWorkerRepository extends JpaRepository<HealthcareWorker, Long> {
    Optional<HealthcareWorker> findByUserId(Long userId);
    List<HealthcareWorker> findByWorkerRoleAndAcceptingReferralsTrue(String workerRole);
    List<HealthcareWorker> findByServiceAreaAndWorkerRole(String serviceArea, String workerRole);
    List<HealthcareWorker> findByFacilityId(Long facilityId);
}
