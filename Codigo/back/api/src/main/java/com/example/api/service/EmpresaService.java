package com.example.api.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.api.DTO.AgentesDTO;
import com.example.api.model.Agentes;
import com.example.api.model.Empresa;
import com.example.api.repository.AgentesRepository;

import jakarta.transaction.Transactional;

@Service
public class EmpresaService {
    
    @Autowired
    private AgentesRepository agentesRepository;
    
    @Transactional
    public Empresa cadastrarBanco(AgentesDTO dto){
        if(agentesRepository.existsByEmail(dto.getEmail())||agentesRepository.existsByCnpj(dto.getCnpj())){
        throw new RuntimeException("Ja existe usuario com este email ou cnpj.");
    }

    Empresa empresa = new Empresa();

    empresa.setNome(dto.getNome());
    empresa.setEmail(dto.getEmail());
    empresa.setCnpj(dto.getCnpj());
    empresa.setSenha(dto.getSenha());

    return agentesRepository.save(empresa);
    
    }

    public Optional<Agentes> login(String email, String senha) {
        Optional<Agentes> empresa = agentesRepository.findByEmail(email);
        if (empresa.isPresent() && empresa.get().getSenha().equals(senha)) {
            return empresa;
        }
        return Optional.empty();
    }
}
