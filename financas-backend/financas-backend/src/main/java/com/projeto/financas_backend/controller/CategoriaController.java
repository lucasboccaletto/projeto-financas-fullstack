package com.projeto.financas_backend.controller;

import com.projeto.financas_backend.model.Categoria;
import com.projeto.financas_backend.model.Usuario;
import com.projeto.financas_backend.repository.CategoriaRepository;
import com.projeto.financas_backend.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public CategoriaController(CategoriaRepository categoriaRepository, UsuarioRepository usuarioRepository) {
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario getUsuario(Authentication auth) {
        return usuarioRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @GetMapping
    public List<Categoria> listar(Authentication auth) {
        return categoriaRepository.findByUsuario(getUsuario(auth));
    }

    @PostMapping
    public ResponseEntity<Categoria> criar(@RequestBody Categoria categoria, Authentication auth) {
        categoria.setUsuario(getUsuario(auth));
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizar(@PathVariable Long id, @RequestBody Categoria dados, Authentication auth) {
        return categoriaRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(c -> {
                    c.setNome(dados.getNome());
                    c.setCor(dados.getCor());
                    c.setIcone(dados.getIcone());
                    c.setTipo(dados.getTipo());
                    return ResponseEntity.ok(categoriaRepository.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication auth) {
        return categoriaRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(c -> {
                    categoriaRepository.delete(c);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
