package com.scheduler.controller;

import com.scheduler.model.Appointment;
import com.scheduler.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        return ResponseEntity.ok(appointmentService.createAppointment(appointment));
    }

    @GetMapping("/professional/{professionalId}")
    public ResponseEntity<List<Appointment>> getProfessionalAppointments(@PathVariable String professionalId) {
        return ResponseEntity.ok(appointmentService.getProfessionalAppointments(professionalId));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Appointment> confirmAppointment(@PathVariable String id) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(id));
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable String id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(id));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointment(@PathVariable String id) {
        return ResponseEntity.ok(appointmentService.getAppointment(id));
    }
}