package com.projeto.financas_backend.controller;

import com.projeto.financas_backend.model.Orcamento;
import com.projeto.financas_backend.model.Usuario;
import com.projeto.financas_backend.repository.CategoriaRepository;
import com.projeto.financas_backend.repository.OrcamentoRepository;
import com.projeto.financas_backend.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orcamentos")
public class OrcamentoController {

    private final OrcamentoRepository orcamentoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public OrcamentoController(OrcamentoRepository orcamentoRepository, CategoriaRepository categoriaRepository, UsuarioRepository usuarioRepository) {
        this.orcamentoRepository = orcamentoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario getUsuario(Authentication auth) {
        return usuarioRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @GetMapping
    public List<Orcamento> listar(Authentication auth) {
        return orcamentoRepository.findByUsuario(getUsuario(auth));
    }

    @GetMapping("/mes")
    public List<Orcamento> listarPorMes(@RequestParam int mes, @RequestParam int ano, Authentication auth) {
        return orcamentoRepository.findByUsuarioAndMesAndAno(getUsuario(auth), mes, ano);
    }

    @PostMapping
    public ResponseEntity<Orcamento> criar(@RequestBody Orcamento orcamento, Authentication auth) {
        Usuario usuario = getUsuario(auth);
        orcamento.setUsuario(usuario);
        if (orcamento.getCategoria() != null && orcamento.getCategoria().getId() != null) {
            categoriaRepository.findByIdAndUsuario(orcamento.getCategoria().getId(), usuario)
                    .ifPresent(orcamento::setCategoria);
        }
        return ResponseEntity.ok(orcamentoRepository.save(orcamento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Orcamento> atualizar(@PathVariable Long id, @RequestBody Orcamento dados, Authentication auth) {
        Usuario usuario = getUsuario(auth);
        return orcamentoRepository.findByIdAndUsuario(id, usuario)
                .map(o -> {
                    o.setValorLimite(dados.getValorLimite());
                    o.setMes(dados.getMes());
                    o.setAno(dados.getAno());
                    if (dados.getCategoria() != null && dados.getCategoria().getId() != null) {
                        categoriaRepository.findByIdAndUsuario(dados.getCategoria().getId(), usuario)
                                .ifPresent(o::setCategoria);
                    }
                    return ResponseEntity.ok(orcamentoRepository.save(o));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication auth) {
        return orcamentoRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(o -> {
                    orcamentoRepository.delete(o);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
