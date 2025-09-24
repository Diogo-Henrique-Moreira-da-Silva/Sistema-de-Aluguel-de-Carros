package com.example.api.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarroDTO {
    private String placa;
    private String modelo;
    private String fabricante;
    private String status;
    private String proprietario;
    private String locatario;
    private double diaria;
}
