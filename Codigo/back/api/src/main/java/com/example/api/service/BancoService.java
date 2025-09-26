package com.example.api.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.api.DTO.BancoDTO;
import com.example.api.model.Agentes;
import com.example.api.model.Banco;
import com.example.api.repository.AgentesRepository;

import jakarta.transaction.Transactional;

@Service
public class BancoService {
    
    @Autowired
    private AgentesRepository agentesRepository;
    
    @Transactional
    public Banco cadastrarBanco(BancoDTO dto){
        if(agentesRepository.existsByEmail(dto.getEmail())||agentesRepository.existsByCnpj(dto.getCnpj())){
        throw new RuntimeException("Ja existe usuario com este email ou cnpj.");
    }

    Banco banco = new Banco();

    banco.setNome(dto.getNome());
    banco.setEmail(dto.getEmail());
    banco.setCnpj(dto.getCnpj());
    banco.setCompe(dto.getCompe());
    banco.setSenha(dto.getSenha());

    return agentesRepository.save(banco);
    
    }

    public Optional<Agentes> login(String email, String senha) {
        Optional<Agentes> banco = agentesRepository.findByEmail(email);
        if (banco.isPresent() && banco.get().getSenha().equals(senha)) {
            return banco;
        }
        return Optional.empty();
    }
}
