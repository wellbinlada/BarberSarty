package com.scheduler.repository;

import com.scheduler.model.Professional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfessionalRepository extends JpaRepository<Professional, String> {
    Optional<Professional> findByEmail(String email);
}