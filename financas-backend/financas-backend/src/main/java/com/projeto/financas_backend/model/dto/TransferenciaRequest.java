package com.projeto.financas_backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransferenciaRequest(
        Long contaOrigemId,
        Long contaDestinoId,
        BigDecimal valor,
        LocalDate dataTransacao,
        String descricao,
        String observacao
) {}
