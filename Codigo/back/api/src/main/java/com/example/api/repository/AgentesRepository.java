package com.example.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.api.model.Agentes;

public interface AgentesRepository extends JpaRepository <Agentes, Long>{
    
    Optional<Agentes> findById(long id);

    boolean existsByEmail(String email);

    boolean existsByCnpj(String cnpj);

    Optional<Agentes> findByEmail(String email);


}
