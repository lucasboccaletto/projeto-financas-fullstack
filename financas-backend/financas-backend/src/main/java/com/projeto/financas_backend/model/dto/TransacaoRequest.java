package com.projeto.financas_backend.model.dto;

import com.projeto.financas_backend.model.Recorrencia;
import com.projeto.financas_backend.model.StatusTransacao;
import com.projeto.financas_backend.model.TipoTransacao;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransacaoRequest(
        String descricao,
        BigDecimal valor,
        TipoTransacao tipo,
        String categoria,
        Long categoriaId,
        Long contaId,
        LocalDate dataTransacao,
        LocalDate dataVencimento,
        StatusTransacao status,
        Recorrencia recorrencia,
        Integer totalParcelas,
        String observacao
) {}
