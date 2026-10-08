package com.projeto.financas_backend.repository;

import com.projeto.financas_backend.model.Categoria;
import com.projeto.financas_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByUsuario(Usuario usuario);
    Optional<Categoria> findByIdAndUsuario(Long id, Usuario usuario);
}
