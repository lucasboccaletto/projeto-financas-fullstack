package com.projeto.financas_backend.repository;

import com.projeto.financas_backend.model.Meta;
import com.projeto.financas_backend.model.StatusMeta;
import com.projeto.financas_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MetaRepository extends JpaRepository<Meta, Long> {
    List<Meta> findByUsuario(Usuario usuario);
    List<Meta> findByUsuarioAndStatus(Usuario usuario, StatusMeta status);
    Optional<Meta> findByIdAndUsuario(Long id, Usuario usuario);
}
