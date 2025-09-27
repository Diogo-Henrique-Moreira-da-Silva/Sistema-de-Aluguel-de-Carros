package com.example.api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.api.DTO.AluguelDTO;
import com.example.api.model.Aluguel;
import com.example.api.service.AluguelService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/aluguel")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AluguelController {

    private final AluguelService aluguelService;

    @PostMapping("/solicitar")
    public ResponseEntity<Aluguel> solicitar(@RequestBody AluguelDTO dto) {
        Aluguel solicitacao = aluguelService.solicitar(dto);
        return ResponseEntity
                .created(URI.create("/aluguel/" + solicitacao.getId()))
                .body(solicitacao); 
    }
    @GetMapping("/proprietario/{proprietarioId}/pendentes")
public ResponseEntity<List<Aluguel>> listarPendentes(@PathVariable Long proprietarioId) {
    return ResponseEntity.ok(aluguelService.listarPendentes(proprietarioId));
}

    @PutMapping("/aprovar/{id}")
    public ResponseEntity<Aluguel> aprovar(@PathVariable Long id) {
        Aluguel aprovado = aluguelService.aprovar(id);
        return ResponseEntity.ok(aprovado);
    }

    @PutMapping("/rejeitar/{id}")
    public ResponseEntity<Aluguel> rejeitar(@PathVariable Long id) {
        Aluguel rejeitado = aluguelService.rejeitar(id);
        return ResponseEntity.ok(rejeitado);
    }
}
