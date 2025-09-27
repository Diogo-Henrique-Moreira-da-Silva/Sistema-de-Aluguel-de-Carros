package com.example.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.api.DTO.AluguelDTO;
import com.example.api.model.Aluguel;
import com.example.api.model.Carro;
import com.example.api.model.Cliente;
import com.example.api.repository.AluguelRepository;
import com.example.api.repository.CarroRepository;
import com.example.api.repository.ClienteRepository;

import jakarta.transaction.Transactional;

@Service
public class AluguelService {
    
    @Autowired
    private AluguelRepository aluguelRepository;
    @Autowired
    private CarroRepository carroRepository;
    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public Aluguel solicitar(AluguelDTO dto){
        Carro carro = carroRepository.findById(dto.getCarroId())
                                                .orElseThrow(()-> new RuntimeException("Carro Indisponivel"));
        if(carro.getStatus().equals("Alugado")){
            throw new RuntimeException("Carro indisponivel");
        }
        Cliente locatario = clienteRepository.findById(dto.getLocatarioId())
                                                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        Aluguel solicitacao = new Aluguel();
        solicitacao.setCarro(carro);
        solicitacao.setProprietario(carro.getProprietario());
        solicitacao.setDias(dto.getDias());
        solicitacao.setLocatario(locatario);
        solicitacao.setStatus("EM ABERTO");

        return aluguelRepository.save(solicitacao);
    }

    public Aluguel aprovar(Long id){
        Aluguel aprovado = aluguelRepository.findById(id)
                                .orElseThrow(()-> new RuntimeException("Solicitação nao encontrada"));
        aprovado.setStatus("APROVADO");
        aprovado.setInicio(java.time.OffsetDateTime.now());

        return aluguelRepository.save(aprovado);
    }

    public Aluguel rejeitar(Long id){
        Aluguel reprovada = aluguelRepository.findById(id)
                                    .orElseThrow(()-> new RuntimeException("Solicitação nao encontrada."));
        reprovada.setStatus("REPROVADA");

        return aluguelRepository.save(reprovada);        
    }

    public List<Aluguel> listarPendentes(Long proprietarioId) {
    return aluguelRepository
        .findByProprietario_IdAndStatusOrderByIdDesc(proprietarioId, "EM ABERTO");
}

}
