package com.mtotocare.africa.vaccination;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VaccinationScheduleRepository extends JpaRepository<VaccinationSchedule, Long> {
    List<VaccinationSchedule> findByActiveTrue();
    List<VaccinationSchedule> findByActiveTrueOrderByRecommendedAgeWeeksAsc();
    Optional<VaccinationSchedule> findByVaccineCode(String vaccineCode);
}
