package com.example.api.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("Empresa")
public class Empresa extends Agentes {
    
}
