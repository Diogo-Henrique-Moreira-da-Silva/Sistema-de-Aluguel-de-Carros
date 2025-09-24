package com.example.api.service;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.api.DTO.CarroDTO;
import com.example.api.model.Carro;
import com.example.api.repository.CarroRepository;

@Service
public class CarroService {
    
    @Autowired
    private CarroRepository carroRepository;

    public Carro cadastrarCarro(CarroDTO dto){
        if(carroRepository.existsByPlaca(dto.getPlaca())){
            throw new RuntimeException("Já existe um carro com esta placa.");
        }

        Carro carro = new Carro();
        carro.setModelo(dto.getModelo());
        carro.setPlaca(dto.getPlaca());
        carro.setFabricante(dto.getFabricante());
        carro.setProprietario(dto.getProprietario());
        carro.setDiaria(dto.getDiaria());
        carro.setStatus("Disponivel");

        return carroRepository.save(carro);
    }

    public void excluirCarro(String placa){
        if(!carroRepository.existsByPlaca(placa)){
            throw new RuntimeException("Carro não encontrado");
        }
        carroRepository.deleteByPlaca(placa);
    }

    public Carro alugar (String placa){
        Carro carro = carroRepository.findByPlaca(placa)
                .orElseThrow(() -> new RuntimeException("Carro não encontrado"));
        carro.setStatus("Alugado");
        return carroRepository.save(carro);
    }
}
