package com.example.api.DTO;

public record CarroCardDTO(
    long id,
    String placa,      
    String fabricante,
    String modelo,
    Integer ano,         
    Double diaria,
    String status,
    long proprietarioId,
    String proprietarioNome,
    String proprietarioTipo  
) {}
