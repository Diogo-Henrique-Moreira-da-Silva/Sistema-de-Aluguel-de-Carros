package com.example.api.DTO;

import com.example.api.model.Aluguel;
import lombok.Getter;

@Getter
public class AluguelResumoDTO {

    private Long id;

    private Long   carroId;
    private String carroModelo;
    private String carroFabricante;
    private String placa;

    private Long   clienteId;
    private String clienteNome;

    private Integer dias;
    private double  diaria;
    private double  valor;

    private String  status;

    public static AluguelResumoDTO from(Aluguel a) {
        AluguelResumoDTO dto = new AluguelResumoDTO();

        dto.id              = a.getId();

        dto.carroId         = a.getCarro().getId();
        dto.carroModelo     = a.getCarro().getModelo();
        dto.carroFabricante = a.getCarro().getFabricante();
        dto.placa           = a.getCarro().getPlaca();

        dto.clienteId       = a.getLocatario().getId();
        dto.clienteNome     = a.getLocatario().getNome();

        dto.dias            = a.getDias();
        dto.diaria          = a.getCarro().getDiaria();   // double
        // se já houver valor no modelo, usa; senão calcula (diária * dias):
        Double valorModel   = a.getValor();               // se getValor() for Double
        dto.valor           = (valorModel != null ? valorModel : dto.diaria * dto.dias);

        dto.status          = a.getStatus();
        return dto;
    }
}
