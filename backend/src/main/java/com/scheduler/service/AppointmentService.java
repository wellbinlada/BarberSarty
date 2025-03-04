package com.scheduler.service;

import com.scheduler.model.Appointment;
import com.scheduler.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;

    public Appointment createAppointment(Appointment appointment) {
        appointment.setStatus("pending");
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getProfessionalAppointments(String professionalId) {
        return appointmentRepository.findByProfessionalId(professionalId);
    }

    public Appointment confirmAppointment(String id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus("confirmed");
        return appointmentRepository.save(appointment);
    }
    
    public Appointment cancelAppointment(String id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus("cancelled");
        return appointmentRepository.save(appointment);
    }
    
    public Appointment getAppointment(String id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
}