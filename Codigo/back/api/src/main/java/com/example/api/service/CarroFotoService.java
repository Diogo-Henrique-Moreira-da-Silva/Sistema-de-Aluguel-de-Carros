package com.example.api.service;

import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.api.model.Carro;
import com.example.api.model.CarroFoto;
import com.example.api.repository.CarroFotoRepository;
import com.example.api.repository.CarroRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarroFotoService {

  private final CarroRepository carroRepository;
  private final CarroFotoRepository fotoRepository;

  private static final long MAX_SIZE = 5L * 1024 * 1024; // 5 MB

  @Transactional
  public CarroFoto upload(Long carroId, MultipartFile file, boolean capa) throws IOException {
    if (file.isEmpty()) throw new RuntimeException("Arquivo vazio.");
    if (file.getSize() > MAX_SIZE) throw new RuntimeException("Arquivo excede 5 MB.");
    if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
      throw new RuntimeException("Tipo de arquivo inválido (somente imagens).");
    }

    Carro carro = carroRepository.findById(carroId)
        .orElseThrow(() -> new RuntimeException("Carro não encontrado."));

    CarroFoto foto = new CarroFoto();
    foto.setCarro(carro);
    foto.setFilename(file.getOriginalFilename());
    foto.setContentType(file.getContentType());
    foto.setSize(file.getSize());
    foto.setCapa(capa);
    foto.setData(file.getBytes()); 

    if (capa) {
      List<CarroFoto> existentes = fotoRepository.findByCarro_Id(carroId);
      for (CarroFoto f : existentes) f.setCapa(false);
      foto.setCapa(true);
    }

    return fotoRepository.save(foto);
  }

  @Transactional(readOnly = true)
  public List<CarroFoto> listarMetadados(Long carroId) {
    return fotoRepository.findByCarro_Id(carroId);
  }

  @Transactional(readOnly = true)
  public CarroFoto buscarConteudo(Long fotoId) {
    return fotoRepository.findById(fotoId)
        .orElseThrow(() -> new RuntimeException("Foto não encontrada."));
  }

  @Transactional
  public void deletar(Long fotoId) {
    fotoRepository.deleteById(fotoId);
  }
}
