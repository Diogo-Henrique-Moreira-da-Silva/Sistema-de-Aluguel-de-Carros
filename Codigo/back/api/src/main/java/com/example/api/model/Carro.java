package com.example.api.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "carro")
@Getter
@Setter

public class Carro{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true)
    private String placa;

    private String modelo;

    private String fabricante;

    private String status;

    private String locatario;

    private double diaria;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="agente_id", nullable = false, foreignKey = @ForeignKey(name = "fk_aluguel_proprietario"))
    private Agentes proprietario;

}