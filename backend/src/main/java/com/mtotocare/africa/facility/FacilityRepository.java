package com.mtotocare.africa.facility;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByActiveTrue();
    List<Facility> findByRegionAndActiveTrue(String region);
    List<Facility> findByFacilityTypeAndActiveTrue(String facilityType);
}
