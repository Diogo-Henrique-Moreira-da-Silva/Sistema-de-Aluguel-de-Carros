package com.example.api.service;

import com.example.api.DTO.ClienteDTO;
import com.example.api.model.Cliente;
import com.example.api.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public Cliente cadastrarCliente(ClienteDTO dto) {
        if (clienteRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Já existe um cliente com este email.");
        }

        Cliente cliente = new Cliente();
        cliente.setNome(dto.getNome());
        cliente.setEmail(dto.getEmail());
        cliente.setCpf(dto.getCpf());
        cliente.setRg(dto.getRg());
        cliente.setEndereco(dto.getEndereco());  // 🔥 novo
        cliente.setProfissao(dto.getProfissao()); // 🔥 novo
        cliente.setEmpregador(dto.getEmpregador());
        cliente.setRendimento(dto.getRendimento());
        cliente.setSenha(dto.getSenha());

        return clienteRepository.save(cliente);
    }

    public Optional<Cliente> login(String email, String senha) {
        Optional<Cliente> cliente = clienteRepository.findByEmail(email);
        if (cliente.isPresent() && cliente.get().getSenha().equals(senha)) {
            return cliente;
        }
        return Optional.empty();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente atualizarCliente(Long id, Cliente clienteAtualizado) {
        return clienteRepository.findById(id).map(cliente -> {
            cliente.setNome(clienteAtualizado.getNome());
            cliente.setCpf(clienteAtualizado.getCpf());
            cliente.setRg(clienteAtualizado.getRg());
            cliente.setEmail(clienteAtualizado.getEmail());
            cliente.setEndereco(clienteAtualizado.getEndereco());
            cliente.setProfissao(clienteAtualizado.getProfissao());
            cliente.setEmpregador(clienteAtualizado.getEmpregador());
            cliente.setRendimento(clienteAtualizado.getRendimento());
            // Atualiza a senha só se foi enviada no request
            if (clienteAtualizado.getSenha() != null && !clienteAtualizado.getSenha().isBlank()) {
                cliente.setSenha(clienteAtualizado.getSenha());
            }
            return clienteRepository.save(cliente);
        }).orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    public void excluirCliente(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente não encontrado");
        }
        clienteRepository.deleteById(id);
    }
}
