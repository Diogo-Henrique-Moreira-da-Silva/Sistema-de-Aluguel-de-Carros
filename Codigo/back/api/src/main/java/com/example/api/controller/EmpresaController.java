package com.example.api.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.api.DTO.AgentesDTO;
import com.example.api.model.Agentes;
import com.example.api.model.Empresa;
import com.example.api.service.EmpresaService;

@RestController
@RequestMapping("/agentes/empresa")
@CrossOrigin(origins="*")
public class EmpresaController {
    
    @Autowired
    private EmpresaService empresaService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody AgentesDTO dto){
        try {
            Empresa novaEmpresa = empresaService.cadastrarBanco(dto);
            return ResponseEntity.ok(novaEmpresa);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AgentesDTO dto) {
        Optional<Agentes> empresa = empresaService.login(dto.getEmail(), dto.getSenha());
        if (empresa.isPresent()) {
            return ResponseEntity.ok(empresa.get());
        }
        return ResponseEntity.status(401).body("Email ou senha inválidos.");
    }
}
