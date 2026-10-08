package com.projeto.financas_backend.repository;

import com.projeto.financas_backend.model.Conta;
import com.projeto.financas_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContaRepository extends JpaRepository<Conta, Long> {
    List<Conta> findByUsuarioAndAtivaTrue(Usuario usuario);
    List<Conta> findByUsuario(Usuario usuario);
    Optional<Conta> findByIdAndUsuario(Long id, Usuario usuario);
}
