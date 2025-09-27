package com.example.api.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.api.model.Aluguel;

public interface AluguelRepository extends JpaRepository<Aluguel, Long> {

    List<Aluguel> findByProprietario_IdAndStatusOrderByIdDesc(Long proprietarioId, String status);

    boolean existsByCarro_IdAndStatus(Long carroId, String status);
}
