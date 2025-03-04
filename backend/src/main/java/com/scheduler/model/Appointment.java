package com.scheduler.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String clientName;
    private LocalDate date;
    private LocalTime time;
    private String status = "pending";
    
    @ManyToOne
    @JoinColumn(name = "professional_id")
    private Professional professional;
}