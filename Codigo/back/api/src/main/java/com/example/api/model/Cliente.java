package com.example.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cliente")
@Getter 
@Setter
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true)
    private String rg;

    @Column(unique = true)
    private String cpf;

    @NotBlank(message = "nome é obrigatório")
    private String nome;

    private String endereco;

    private String profissao;

    @Email
    @NotBlank(message = "E-mail é obrigatório")
    @Column(unique = true)
    private String email;

    private String empregador;

    private double rendimento;

    private String senha;
}
