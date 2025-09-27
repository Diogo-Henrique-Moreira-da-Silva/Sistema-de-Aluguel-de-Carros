package com.example.api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.api.DTO.AluguelDTO;
import com.example.api.DTO.AluguelResumoDTO;
import com.example.api.DTO.AluguelSolicitacaoDTO;
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
    public ResponseEntity<Void> solicitar(@RequestBody AluguelSolicitacaoDTO dto) {
        Aluguel solicitacao = aluguelService.solicitar(dto);
        return ResponseEntity.created(URI.create("/aluguel/" + solicitacao.getId()))
            .build(); 
    }

    @GetMapping("/proprietario/{proprietarioId}/pendentes")
    public ResponseEntity<List<AluguelResumoDTO>> listarPendentes(@PathVariable Long proprietarioId) {
        return ResponseEntity.ok(aluguelService.listarPendentes(proprietarioId));
    }


    // NOVO: aprovar
    @PutMapping("/aprovar/{id}")
    public ResponseEntity<AluguelResumoDTO> aprovar(@PathVariable Long id) {
        return ResponseEntity.ok(aluguelService.aprovar(id));
    }

    // NOVO: rejeitar
    @PutMapping("/rejeitar/{id}")
    public ResponseEntity<AluguelResumoDTO> rejeitar(@PathVariable Long id) {
        return ResponseEntity.ok(aluguelService.rejeitar(id));
    }
}
