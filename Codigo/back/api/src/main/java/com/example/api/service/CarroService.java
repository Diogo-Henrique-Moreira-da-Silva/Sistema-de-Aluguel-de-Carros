package com.example.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.api.DTO.CarroCardDTO;
import com.example.api.DTO.CarroDTO;
import com.example.api.model.Agentes;
import com.example.api.model.Banco;
import com.example.api.model.Carro;
import com.example.api.model.Empresa;
import com.example.api.repository.AgentesRepository;
import com.example.api.repository.CarroRepository;

import jakarta.transaction.Transactional;

@Service
public class CarroService {

    @Autowired private CarroRepository carroRepository;
    @Autowired private AgentesRepository agentesRepository;

    @Transactional
    public Carro cadastrarCarro(CarroDTO dto){
        final String placa = dto.getPlaca() != null ? dto.getPlaca().toUpperCase() : null;
        if (placa == null || placa.isBlank()) {
            throw new RuntimeException("Placa é obrigatória.");
        }
        if (carroRepository.existsByPlaca(placa)) {
            throw new RuntimeException("Já existe um carro com esta placa.");
        }

        Agentes proprietario = agentesRepository.findById(dto.getProprietarioId())
            .orElseThrow(() -> new RuntimeException("Proprietário não encontrado"));

        Carro carro = new Carro();
        carro.setModelo(dto.getModelo());
        carro.setPlaca(placa);
        carro.setFabricante(dto.getFabricante());
        carro.setDiaria(dto.getDiaria() != null ? dto.getDiaria() : 0.0);
        carro.setStatus("Disponivel");
        carro.setProprietario(proprietario);

        return carroRepository.save(carro);
    }

    @Transactional
    public void excluirCarro(String placa){
        final String norm = placa == null ? "" : placa.trim().toUpperCase();
        Carro carro = carroRepository.findByPlaca(norm)
        .orElseThrow(() -> new RuntimeException("Carro não encontrado"));
    carroRepository.delete(carro);
    }

    @Transactional
    public Carro alugar(String placa){
        final String norm = placa != null ? placa.toUpperCase() : "";
        Carro carro = carroRepository.findByPlaca(norm)
            .orElseThrow(() -> new RuntimeException("Carro não encontrado"));
        carro.setStatus("Alugado");
        return carroRepository.save(carro);
    }

    public Optional<Carro> buscarPorPlaca(String placa) {
        final String norm = placa != null ? placa.toUpperCase() : "";
        return carroRepository.findByPlaca(norm);
    }

    @Transactional
    public List<CarroCardDTO> listarTodos() {
        List<Carro> carros = carroRepository.findAllWithProprietario();

        return carros.stream().map(c -> {
            Agentes p = c.getProprietario();
            String tipo = (p instanceof Banco) ? "Banco"
                       : (p instanceof Empresa) ? "Empresa"
                       : "Agente";

            Integer ano = null;

            return new CarroCardDTO(
                c.getId(),
                c.getPlaca(),          
                c.getFabricante(),
                c.getModelo(),
                ano,
                c.getDiaria(),
                c.getStatus(),
                p.getId(),
                p.getNome(),
                tipo
            );
        }).toList();
    }
}
