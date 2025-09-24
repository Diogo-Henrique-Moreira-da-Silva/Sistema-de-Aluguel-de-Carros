package com.example.api.model;

import java.time.OffsetDateTime;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    private String proprietario;

    private String locatario;

    private double diaria;

}