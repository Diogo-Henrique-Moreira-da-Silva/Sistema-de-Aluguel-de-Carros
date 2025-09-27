package com.example.api.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.api.DTO.AluguelDTO;
import com.example.api.DTO.AluguelResumoDTO;
import com.example.api.DTO.AluguelSolicitacaoDTO;
import com.example.api.model.Aluguel;
import com.example.api.model.Carro;
import com.example.api.model.Cliente;
import com.example.api.repository.AluguelRepository;
import com.example.api.repository.CarroRepository;
import com.example.api.repository.ClienteRepository;

import jakarta.transaction.Transactional;

@Service
public class AluguelService {
    
    @Autowired
    private AluguelRepository aluguelRepository;
    @Autowired
    private CarroRepository carroRepository;
    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public Aluguel solicitar(AluguelSolicitacaoDTO dto){
       Carro carro = carroRepository.findById(dto.getCarroId())
            .orElseThrow(() -> new RuntimeException("Carro indisponível"));

        // Bloqueia novas solicitações se já estiver reservado ou alugado
        if ("RESERVADO".equalsIgnoreCase(carro.getStatus())
         || "ALUGADO".equalsIgnoreCase(carro.getStatus())) {
            throw new RuntimeException("Carro indisponível");
        }

        Cliente locatario = clienteRepository.findById(dto.getLocatarioId())
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Aluguel solicitacao = new Aluguel();
        solicitacao.setCarro(carro);
        solicitacao.setProprietario(carro.getProprietario());
        solicitacao.setDias(dto.getDias());
        solicitacao.setLocatario(locatario);
        solicitacao.setStatus("EM ABERTO");
        solicitacao.setValor(carro.getDiaria() * dto.getDias());

        // <<< aqui muda o status do carro para RESERVADO
        carro.setStatus("RESERVADO");
        carroRepository.save(carro);

        return aluguelRepository.save(solicitacao);
    }

    @Transactional
    public List<AluguelResumoDTO> listarPendentes(Long proprietarioId) {
        return aluguelRepository
            .findByProprietario_IdAndStatusOrderByIdDesc(proprietarioId, "EM ABERTO")
            .stream()
            .map(AluguelResumoDTO::from)
            .toList();
    }

    // ---- novo: aprovar (muda aluguel e carro) ----
    @Transactional
    public AluguelResumoDTO aprovar(Long id){
        Aluguel a = aluguelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

        if (!"EM ABERTO".equalsIgnoreCase(a.getStatus())) {
            throw new RuntimeException("Solicitação não está pendente");
        }

        a.setStatus("APROVADO");
        a.setInicio(OffsetDateTime.now());

        Carro carro = a.getCarro();
        carro.setStatus("ALUGADO");

        return AluguelResumoDTO.from(aluguelRepository.save(a));
    }

    // ---- novo: rejeitar (libera o carro) ----
    @Transactional
    public AluguelResumoDTO rejeitar(Long id){
        Aluguel a = aluguelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

        if (!"EM ABERTO".equalsIgnoreCase(a.getStatus())) {
            throw new RuntimeException("Solicitação não está pendente");
        }

        a.setStatus("REPROVADA");

        Carro carro = a.getCarro();
        carro.setStatus("DISPONIVEL");

        return AluguelResumoDTO.from(aluguelRepository.save(a));
    }
}