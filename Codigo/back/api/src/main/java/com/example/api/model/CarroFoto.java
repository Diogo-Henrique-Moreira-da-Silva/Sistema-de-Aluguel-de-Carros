package com.example.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "carro_foto")
@Getter @Setter
public class CarroFoto {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String filename;          // nome do arquivo

  @Column(nullable = false)
  private String contentType;       // image/jpeg, image/png, ...

  @Column(nullable = false)
  private long size;                // em bytes

  private boolean capa = false;

  @Lob
  @Basic(fetch = FetchType.LAZY)    // evita carregar os bytes sempre
  @Column(nullable = false)
  private byte[] data;              // <-- bytes da imagem (mapeia para bytea)

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "carro_id", nullable = false,
              foreignKey = @ForeignKey(name = "fk_foto_carro"))
  private Carro carro;
}
