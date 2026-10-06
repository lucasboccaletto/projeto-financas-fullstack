package com.projeto.financas_backend.repository;

import com.projeto.financas_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Vamos precisar buscar o usuário pelo nome para fazer o login
    Optional<Usuario> findByUsername(String username);
}