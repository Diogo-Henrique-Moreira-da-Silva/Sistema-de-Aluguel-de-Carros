package com.example.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.api.DTO.CarroDTO;
import com.example.api.model.Carro;
import com.example.api.service.CarroService;

@RestController
@RequestMapping("/carro")
@CrossOrigin(origins="*")
public class CarroController {
    
    @Autowired
    private CarroService carroService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody CarroDTO dto){
        try{
            Carro novoCarro = carroService.cadastrarCarro(dto);
            return ResponseEntity.ok(novoCarro);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable String placa){
        try{
            carroService.excluirCarro(placa);
            return ResponseEntity.noContent().build();
        } catch(RuntimeException e){
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{placa}/alugar")
    public ResponseEntity<?> alugar(@PathVariable String placa){
        try {
            Carro carroAtualizado = carroService.alugar(placa);
            return ResponseEntity.ok(carroAtualizado); 
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
