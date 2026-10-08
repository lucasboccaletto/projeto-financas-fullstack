package com.projeto.financas_backend.controller;

import com.projeto.financas_backend.model.Meta;
import com.projeto.financas_backend.model.StatusMeta;
import com.projeto.financas_backend.model.Usuario;
import com.projeto.financas_backend.repository.MetaRepository;
import com.projeto.financas_backend.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/metas")
public class MetaController {

    private final MetaRepository metaRepository;
    private final UsuarioRepository usuarioRepository;

    public MetaController(MetaRepository metaRepository, UsuarioRepository usuarioRepository) {
        this.metaRepository = metaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario getUsuario(Authentication auth) {
        return usuarioRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @GetMapping
    public List<Meta> listar(Authentication auth) {
        return metaRepository.findByUsuario(getUsuario(auth));
    }

    @PostMapping
    public ResponseEntity<Meta> criar(@RequestBody Meta meta, Authentication auth) {
        meta.setUsuario(getUsuario(auth));
        return ResponseEntity.ok(metaRepository.save(meta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Meta> atualizar(@PathVariable Long id, @RequestBody Meta dados, Authentication auth) {
        return metaRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(m -> {
                    m.setNome(dados.getNome());
                    m.setDescricao(dados.getDescricao());
                    m.setValorObjetivo(dados.getValorObjetivo());
                    m.setDataObjetivo(dados.getDataObjetivo());
                    m.setCor(dados.getCor());
                    m.setIcone(dados.getIcone());
                    m.setStatus(dados.getStatus());
                    m.setConta(dados.getConta());
                    return ResponseEntity.ok(metaRepository.save(m));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/deposito")
    public ResponseEntity<Meta> depositar(@PathVariable Long id, @RequestBody Map<String, BigDecimal> body, Authentication auth) {
        return metaRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(m -> {
                    BigDecimal valor = body.get("valor");
                    if (valor != null && valor.compareTo(BigDecimal.ZERO) > 0) {
                        m.setValorAtual(m.getValorAtual().add(valor));
                        if (m.getValorAtual().compareTo(m.getValorObjetivo()) >= 0) {
                            m.setStatus(StatusMeta.CONCLUIDA);
                        }
                    }
                    return ResponseEntity.ok(metaRepository.save(m));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication auth) {
        return metaRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(m -> {
                    metaRepository.delete(m);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
