package com.example.api.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.api.DTO.BancoDTO;
import com.example.api.model.Agentes;
import com.example.api.model.Banco;
import com.example.api.service.BancoService;

@RestController
@RequestMapping("/agentes/banco")
@CrossOrigin(origins="*")
public class BancoController {
    
    @Autowired
    private BancoService bancoService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody BancoDTO dto){
        try {
            Banco novoBanco = bancoService.cadastrarBanco(dto);
            return ResponseEntity.ok(novoBanco);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody BancoDTO dto) {
        Optional<Agentes> banco = bancoService.login(dto.getEmail(), dto.getSenha());
        if (banco.isPresent()) {
            return ResponseEntity.ok(banco.get());
        }
        return ResponseEntity.status(401).body("Email ou senha inválidos.");
    }
}
