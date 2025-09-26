package com.example.api.repository;

import com.example.api.model.Carro;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CarroRepository extends JpaRepository <Carro, Long>{

    boolean existsByPlaca(String placa);

    void deleteByPlaca(String placa);

    Optional<Carro> findByPlaca(String placa);
    
}
