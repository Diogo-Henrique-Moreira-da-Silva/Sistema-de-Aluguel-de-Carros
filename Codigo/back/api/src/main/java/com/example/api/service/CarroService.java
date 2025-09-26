package com.example.api.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.api.DTO.CarroDTO;
import com.example.api.model.Agentes;
import com.example.api.model.Carro;
import com.example.api.repository.AgentesRepository;
import com.example.api.repository.CarroRepository;

@Service
public class CarroService {
    
    @Autowired
    private CarroRepository carroRepository;
    @Autowired
    private AgentesRepository agentesRepository;

    public Carro cadastrarCarro(CarroDTO dto){
        if(carroRepository.existsByPlaca(dto.getPlaca())){
            throw new RuntimeException("Já existe um carro com esta placa.");
        }
        Agentes proprietario = agentesRepository.findById(dto.getProprietarioId())
            .orElseThrow(() -> new RuntimeException("Proprietário não encontrado"));

        Carro carro = new Carro();
        carro.setModelo(dto.getModelo());
        carro.setPlaca(dto.getPlaca());
        carro.setFabricante(dto.getFabricante());
        carro.setDiaria(dto.getDiaria());
        carro.setStatus("Disponivel");
        carro.setProprietario(proprietario); 

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
