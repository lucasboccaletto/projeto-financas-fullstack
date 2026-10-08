package com.projeto.financas_backend.repository;

import com.projeto.financas_backend.model.StatusTransacao;
import com.projeto.financas_backend.model.TipoTransacao;
import com.projeto.financas_backend.model.Transacao;
import com.projeto.financas_backend.model.Usuario;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TransacaoSpec {

    public static Specification<Transacao> filter(
            Usuario usuario,
            TipoTransacao tipo,
            Long categoriaId,
            Long contaId,
            StatusTransacao status,
            LocalDate dataInicio,
            LocalDate dataFim,
            String descricao
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("usuario"), usuario));

            if (tipo != null) {
                predicates.add(cb.equal(root.get("tipo"), tipo));
            }
            if (categoriaId != null) {
                predicates.add(cb.equal(root.get("categoriaEntidade").get("id"), categoriaId));
            }
            if (contaId != null) {
                predicates.add(cb.equal(root.get("conta").get("id"), contaId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (dataInicio != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataTransacao"), dataInicio));
            }
            if (dataFim != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataTransacao"), dataFim));
            }
            if (descricao != null && !descricao.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("descricao")), "%" + descricao.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
