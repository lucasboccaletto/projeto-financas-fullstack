package com.projeto.financas_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "metas")
@Getter @Setter @NoArgsConstructor
public class Meta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome da meta não pode ser vazio")
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @NotNull(message = "Valor objetivo é obrigatório")
    @Column(precision = 15, scale = 2)
    private BigDecimal valorObjetivo;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorAtual = BigDecimal.ZERO;

    private LocalDate dataObjetivo;
    private String cor = "#28a745";
    private String icone = "target";

    @Enumerated(EnumType.STRING)
    private StatusMeta status = StatusMeta.ATIVA;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "conta_id")
    @JsonIgnoreProperties({"usuario", "hibernateLazyInitializer", "handler"})
    private Conta conta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private Usuario usuario;
}
