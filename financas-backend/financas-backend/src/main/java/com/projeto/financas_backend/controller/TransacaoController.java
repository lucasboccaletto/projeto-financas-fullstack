package com.projeto.financas_backend.controller;

import com.projeto.financas_backend.model.Transacao;
import com.projeto.financas_backend.model.Usuario;
import com.projeto.financas_backend.repository.TransacaoRepository;
import com.projeto.financas_backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Método ajudante: descobre quem é o usuário baseado no Token que chegou
    private Usuario getUsuarioLogado() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByUsername(username).orElse(null);
    }

    // Rota para buscar as transações filtradas pelo dono
    @GetMapping
    public List<Transacao> listarTodas() {
        Usuario usuarioLogado = getUsuarioLogado();
        return transacaoRepository.findByUsuario(usuarioLogado);
    }

    // Rota para salvar uma nova transação (carimbando o dono antes de salvar)
    @PostMapping
    public Transacao criar(@RequestBody Transacao transacao) {
        Usuario usuarioLogado = getUsuarioLogado();
        transacao.setUsuario(usuarioLogado); // Carimba o dono!
        return transacaoRepository.save(transacao);
    }

    // Rota para deletar uma transação específica
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        transacaoRepository.deleteById(id);
    }
}