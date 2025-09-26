package com.example.api.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.api.model.Aluguel;

public interface AluguelRepository extends JpaRepository <Aluguel, Long> {
    
    Optional <Aluguel> findById(long id);

}
