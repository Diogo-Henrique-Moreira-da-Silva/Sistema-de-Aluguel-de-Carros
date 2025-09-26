package com.example.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.api.DTO.AluguelDTO;
import com.example.api.model.Aluguel;
import com.example.api.service.AluguelService;

@RestController
@RequestMapping("/aluguel")
@CrossOrigin(origins ="*")
public class AluguelController {
    
    @Autowired
    private AluguelService aluguelService;

    @PostMapping("/solicitar")
    public ResponseEntity<?> solicitar(@RequestBody AluguelDTO dto){
        try {
            Aluguel solicitacao = aluguelService.solicitar(dto);
            return ResponseEntity.ok(solicitacao);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/aprovar/{id}")
    public ResponseEntity<?> aprovar(@RequestBody Long id){
        try {
            Aluguel aprovar = aluguelService.aprovar(id);
            return ResponseEntity.ok(aprovar);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rejeitar/{id}")
    public ResponseEntity<?> reprovar(@RequestBody Long id){
        try {
            Aluguel rejeitar = aluguelService.rejeitar(id);
            return ResponseEntity.ok(rejeitar);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
