package com.projeto.financas_backend.repository;

import com.projeto.financas_backend.model.Transacao;
import com.projeto.financas_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    
    // Método customizado para buscar apenas as transações do usuário logado
    List<Transacao> findByUsuario(Usuario usuario);
    
}