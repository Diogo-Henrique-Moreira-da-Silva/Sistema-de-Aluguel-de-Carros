package com.example.api.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AluguelDTO {
    private Integer dias;
    private long id;
    private long carroId;
    private long locatarioId;
}
