package com.mtotocare.africa.vaccination;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByChildIdOrderByNextDoseDueAsc(Long childId);
    List<Vaccination> findByChildId(Long childId);
    long countByChildIdAndStatus(Long childId, String status);

    List<Vaccination> findByChild_IdAndSchedule_Id(Long childId, Long scheduleId);

    @Query("SELECT v FROM Vaccination v WHERE v.status = 'PENDING' AND v.nextDoseDue < :today")
    List<Vaccination> findOverdueVaccinations(@Param("today") LocalDate today);
}
