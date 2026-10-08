package com.projeto.financas_backend.repository;

import com.projeto.financas_backend.model.Transacao;
import com.projeto.financas_backend.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransacaoRepository extends JpaRepository<Transacao, Long>, JpaSpecificationExecutor<Transacao> {

    List<Transacao> findByUsuario(Usuario usuario);

    Page<Transacao> findByUsuario(Usuario usuario, Pageable pageable);

    Optional<Transacao> findByIdAndUsuario(Long id, Usuario usuario);

    List<Transacao> findByUsuarioAndGrupoRecorrencia(Usuario usuario, String grupoRecorrencia);

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario = :usuario AND t.tipo = 'RECEITA' AND t.dataTransacao BETWEEN :inicio AND :fim")
    BigDecimal sumReceitasByPeriodo(@Param("usuario") Usuario usuario, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t WHERE t.usuario = :usuario AND t.tipo = 'DESPESA' AND t.dataTransacao BETWEEN :inicio AND :fim")
    BigDecimal sumDespesasByPeriodo(@Param("usuario") Usuario usuario, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
