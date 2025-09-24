package com.example.api.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteDTO {
    private String nome;
    private String email;
    private String cpf;
    private String rg;
    private String endereco;   
    private String profissao;  
    private String empregador;
    private double rendimento;
    private String senha;     
}
