// CarroFotoController.java
package com.example.api.controller;

import java.util.List;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.api.model.CarroFoto;
import com.example.api.service.CarroFotoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/carros")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CarroFotoController {

  private final CarroFotoService service;

  // Upload de imagem para um carro
  @PostMapping(value = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> upload(
      @PathVariable Long id,
      @RequestPart("file") MultipartFile file,
      @RequestParam(name="capa", defaultValue="false") boolean capa) {
    try {
      CarroFoto salva = service.upload(id, file, capa);
      return ResponseEntity.status(HttpStatus.CREATED).body(
          // opcional: retornar só metadados
          new FotoMeta(salva.getId(), salva.getFilename(), salva.getContentType(),
                       salva.getSize(), salva.isCapa())
      );
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  // Lista metadados das fotos (sem bytes)
  @GetMapping("/{id}/fotos")
  public List<FotoMeta> listar(@PathVariable Long id) {
    return service.listarMetadados(id).stream()
        .map(f -> new FotoMeta(f.getId(), f.getFilename(), f.getContentType(), f.getSize(), f.isCapa()))
        .toList();
  }

  // Download dos bytes (Content-Type correto)
  @GetMapping("/fotos/{fotoId}/conteudo")
  public ResponseEntity<byte[]> conteudo(@PathVariable Long fotoId) {
    CarroFoto f = service.buscarConteudo(fotoId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(f.getContentType()))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + f.getFilename() + "\"")
        .body(f.getData());
  }

  // Apagar
  @DeleteMapping("/fotos/{fotoId}")
  public ResponseEntity<Void> deletar(@PathVariable Long fotoId) {
    service.deletar(fotoId);
    return ResponseEntity.noContent().build();
  }

  // DTO de metadados para respostaa
  record FotoMeta(Long id, String filename, String contentType, long size, boolean capa) {}
}
