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
    private String endereco;   // 🔥 novo
    private String profissao;  // 🔥 novo
    private String empregador;
    private double rendimento;
    private String senha;      // adicionado para facilitar no controller
}
