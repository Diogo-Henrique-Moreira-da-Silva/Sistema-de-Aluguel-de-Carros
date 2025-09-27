package com.example.api.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AluguelDTO {
    private Long id;
    private String status;
    private Integer dias;
    private Double valor;
    private Long carroId;
    private Long locatarioId;
    private Long proprietarioId;
}
