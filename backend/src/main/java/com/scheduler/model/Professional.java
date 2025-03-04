package com.scheduler.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "professionals")
public class Professional {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String name;
    private String email;
    private String password;
}