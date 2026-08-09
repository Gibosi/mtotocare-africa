package com.mtotocare.africa.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByChildIdOrderByAppointmentDatetimeAsc(Long childId);
    List<Appointment> findByStatusOrderByAppointmentDatetimeAsc(String status);
    List<Appointment> findByDoctorIdOrderByAppointmentDatetimeAsc(Long doctorId);
}
