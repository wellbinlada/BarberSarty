package com.scheduler.repository;

import com.scheduler.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByProfessionalId(String professionalId);
}