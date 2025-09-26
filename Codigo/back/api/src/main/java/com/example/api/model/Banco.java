package com.example.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("Banco")
@Getter
@Setter
public class Banco extends Agentes {
    
    @Column(unique=true)
    private long compe;
}
