package com.example.api.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AluguelSolicitacaoDTO {
    private Integer dias;
    private long id;
    private String status;
    private long carroId;
    private long locatarioId;
    private long proprietarioId;

}
