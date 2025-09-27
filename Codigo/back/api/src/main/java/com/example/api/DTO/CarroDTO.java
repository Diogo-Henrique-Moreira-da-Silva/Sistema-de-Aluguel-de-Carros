package com.example.api.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class CarroDTO {
    private Long   id;
    private String fabricante;
    private String modelo;
    private String placa;
    private Double diaria;
    private String status;

    private Long   proprietarioId;
    private String proprietarioNome;
    private String proprietarioTipo;

    public CarroDTO(Long id,
                    String fabricante,
                    String modelo,
                    String placa,
                    Double diaria,
                    String status,
                    Long proprietarioId,
                    String proprietarioNome,
                    String proprietarioTipo) {
        this.id = id;
        this.fabricante = fabricante;
        this.modelo = modelo;
        this.placa = placa;
        this.diaria = diaria;
        this.status = status;
        this.proprietarioId = proprietarioId;
        this.proprietarioNome = proprietarioNome;
        this.proprietarioTipo = proprietarioTipo;
    }
}
