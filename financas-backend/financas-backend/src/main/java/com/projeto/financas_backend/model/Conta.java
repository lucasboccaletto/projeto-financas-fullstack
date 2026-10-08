package com.projeto.financas_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "contas")
@Getter @Setter @NoArgsConstructor
public class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome da conta não pode ser vazio")
    private String nome;

    @NotNull(message = "Tipo é obrigatório")
    @Enumerated(EnumType.STRING)
    private TipoConta tipo;

    @Column(precision = 15, scale = 2)
    private BigDecimal saldoInicial = BigDecimal.ZERO;

    private String cor = "#007bff";
    private String icone = "bank";

    @Column(precision = 15, scale = 2)
    private BigDecimal limite;
    private Integer diaFechamento;
    private Integer diaVencimento;

    private Boolean ativa = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private Usuario usuario;
}
