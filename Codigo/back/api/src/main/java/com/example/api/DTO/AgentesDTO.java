package com.example.api.DTO;

import lombok.Getter;
import lombok.Setter;

@Setter 
@Getter
public class AgentesDTO{
    private long id;
    private String nome;
    private String email;
    private String cnpj;
    private String senha;
    private String endereco;

}