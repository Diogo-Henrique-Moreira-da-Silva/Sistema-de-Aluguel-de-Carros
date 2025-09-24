package com.example.api.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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
@Table(name = "aluguel")
@Getter
@Setter 
public class Aluguel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    private String status; 

    private OffsetDateTime inicio;

    private OffsetDateTime encerramento;

    private BigDecimal valor;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carro_id", nullable = false, foreignKey = @ForeignKey(name = "fk_aluguel_carro"))
    private Carro carro;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="cliente_id", nullable = false, foreignKey = @ForeignKey(name = "fk_aluguel_locatario"))
    private Cliente locatario;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="agente_id", nullable = false, foreignKey = @ForeignKey(name = "fk_aluguel_proprietario"))
    private Agentes proprietario;
}
