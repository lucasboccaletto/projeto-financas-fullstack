package com.projeto.financas_backend.repository;

import com.projeto.financas_backend.model.Orcamento;
import com.projeto.financas_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    List<Orcamento> findByUsuario(Usuario usuario);
    List<Orcamento> findByUsuarioAndMesAndAno(Usuario usuario, Integer mes, Integer ano);
    Optional<Orcamento> findByIdAndUsuario(Long id, Usuario usuario);
}
