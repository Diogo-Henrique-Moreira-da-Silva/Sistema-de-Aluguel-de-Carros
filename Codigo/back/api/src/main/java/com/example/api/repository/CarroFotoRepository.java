package com.example.api.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.api.model.CarroFoto;

public interface CarroFotoRepository extends JpaRepository<CarroFoto, Long> {
  List<CarroFoto> findByCarro_Id(Long carroId);
}
