package com.projeto.financas_backend.controller;

import com.projeto.financas_backend.model.*;
import com.projeto.financas_backend.model.dto.TransacaoRequest;
import com.projeto.financas_backend.model.dto.TransferenciaRequest;
import com.projeto.financas_backend.repository.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/transacoes")
public class TransacaoController {

    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ContaRepository contaRepository;

    public TransacaoController(TransacaoRepository transacaoRepository, UsuarioRepository usuarioRepository,
                                CategoriaRepository categoriaRepository, ContaRepository contaRepository) {
        this.transacaoRepository = transacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.contaRepository = contaRepository;
    }

    private Usuario getUsuario(Authentication auth) {
        return usuarioRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @GetMapping
    public Page<Transacao> listar(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) TipoTransacao tipo,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long contaId,
            @RequestParam(required = false) StatusTransacao status,
            @RequestParam(required = false) LocalDate dataInicio,
            @RequestParam(required = false) LocalDate dataFim,
            @RequestParam(required = false) String descricao
    ) {
        Usuario usuario = getUsuario(auth);
        Specification<Transacao> spec = TransacaoSpec.filter(usuario, tipo, categoriaId, contaId, status, dataInicio, dataFim, descricao);
        return transacaoRepository.findAll(spec, PageRequest.of(page, size, Sort.by("dataTransacao").descending()));
    }

    @GetMapping("/todas")
    public List<Transacao> todas(Authentication auth) {
        return transacaoRepository.findByUsuario(getUsuario(auth));
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody TransacaoRequest req, Authentication auth) {
        Usuario usuario = getUsuario(auth);

        if (req.recorrencia() != null && req.recorrencia() != Recorrencia.UNICA && req.totalParcelas() != null && req.totalParcelas() > 1) {
            String grupo = UUID.randomUUID().toString();
            List<Transacao> criadas = new ArrayList<>();
            for (int i = 0; i < req.totalParcelas(); i++) {
                Transacao t = buildTransacao(req, usuario);
                t.setGrupoRecorrencia(grupo);
                t.setNumeroParcela(i + 1);
                t.setTotalParcelas(req.totalParcelas());
                t.setDataTransacao(incrementarData(req.dataTransacao(), req.recorrencia(), i));
                criadas.add(transacaoRepository.save(t));
            }
            return ResponseEntity.ok(criadas);
        }

        return ResponseEntity.ok(transacaoRepository.save(buildTransacao(req, usuario)));
    }

    @PostMapping("/transferencia")
    public ResponseEntity<?> transferencia(@RequestBody TransferenciaRequest req, Authentication auth) {
        Usuario usuario = getUsuario(auth);
        Conta origem = contaRepository.findByIdAndUsuario(req.contaOrigemId(), usuario).orElseThrow();
        Conta destino = contaRepository.findByIdAndUsuario(req.contaDestinoId(), usuario).orElseThrow();

        Transacao saida = new Transacao();
        saida.setDescricao(req.descricao() != null ? req.descricao() : "Transferência para " + destino.getNome());
        saida.setValor(req.valor());
        saida.setTipo(TipoTransacao.TRANSFERENCIA);
        saida.setDataTransacao(req.dataTransacao());
        saida.setConta(origem);
        saida.setUsuario(usuario);
        saida.setStatus(StatusTransacao.PAGO);

        Transacao entrada = new Transacao();
        entrada.setDescricao(req.descricao() != null ? req.descricao() : "Transferência de " + origem.getNome());
        entrada.setValor(req.valor());
        entrada.setTipo(TipoTransacao.TRANSFERENCIA);
        entrada.setDataTransacao(req.dataTransacao());
        entrada.setConta(destino);
        entrada.setUsuario(usuario);
        entrada.setStatus(StatusTransacao.PAGO);

        return ResponseEntity.ok(List.of(transacaoRepository.save(saida), transacaoRepository.save(entrada)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transacao> atualizar(@PathVariable Long id, @RequestBody TransacaoRequest req, Authentication auth) {
        Usuario usuario = getUsuario(auth);
        return transacaoRepository.findByIdAndUsuario(id, usuario)
                .map(t -> {
                    t.setDescricao(req.descricao());
                    t.setValor(req.valor());
                    t.setTipo(req.tipo());
                    t.setCategoria(req.categoria());
                    t.setDataTransacao(req.dataTransacao());
                    t.setDataVencimento(req.dataVencimento());
                    t.setStatus(req.status() != null ? req.status() : t.getStatus());
                    t.setObservacao(req.observacao());
                    if (req.categoriaId() != null) {
                        categoriaRepository.findByIdAndUsuario(req.categoriaId(), usuario).ifPresent(t::setCategoriaEntidade);
                    }
                    if (req.contaId() != null) {
                        contaRepository.findByIdAndUsuario(req.contaId(), usuario).ifPresent(t::setConta);
                    }
                    return ResponseEntity.ok(transacaoRepository.save(t));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Transacao> alterarStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        return transacaoRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(t -> {
                    StatusTransacao novoStatus = StatusTransacao.valueOf(body.get("status"));
                    t.setStatus(novoStatus);
                    return ResponseEntity.ok(transacaoRepository.save(t));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication auth) {
        return transacaoRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(t -> {
                    transacaoRepository.delete(t);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/exportar/csv")
    public void exportarCsv(
            Authentication auth,
            @RequestParam(required = false) LocalDate dataInicio,
            @RequestParam(required = false) LocalDate dataFim,
            HttpServletResponse response
    ) throws IOException {
        Usuario usuario = getUsuario(auth);
        Specification<Transacao> spec = TransacaoSpec.filter(usuario, null, null, null, null, dataInicio, dataFim, null);
        List<Transacao> transacoes = transacaoRepository.findAll(spec);

        response.setContentType("text/csv;charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"transacoes.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("ID,Descrição,Valor,Tipo,Categoria,Conta,Data,Status,Recorrência,Observação");
        for (Transacao t : transacoes) {
            writer.printf("%d,\"%s\",%.2f,%s,%s,%s,%s,%s,%s,\"%s\"%n",
                    t.getId(),
                    t.getDescricao(),
                    t.getValor(),
                    t.getTipo(),
                    t.getCategoriaEntidade() != null ? t.getCategoriaEntidade().getNome() : (t.getCategoria() != null ? t.getCategoria() : ""),
                    t.getConta() != null ? t.getConta().getNome() : "",
                    t.getDataTransacao(),
                    t.getStatus(),
                    t.getRecorrencia(),
                    t.getObservacao() != null ? t.getObservacao() : ""
            );
        }
        writer.flush();
    }

    private Transacao buildTransacao(TransacaoRequest req, Usuario usuario) {
        Transacao t = new Transacao();
        t.setDescricao(req.descricao());
        t.setValor(req.valor());
        t.setTipo(req.tipo());
        t.setCategoria(req.categoria());
        t.setDataTransacao(req.dataTransacao() != null ? req.dataTransacao() : LocalDate.now());
        t.setDataVencimento(req.dataVencimento());
        t.setStatus(req.status() != null ? req.status() : StatusTransacao.PAGO);
        t.setRecorrencia(req.recorrencia() != null ? req.recorrencia() : Recorrencia.UNICA);
        t.setObservacao(req.observacao());
        t.setUsuario(usuario);
        if (req.categoriaId() != null) {
            categoriaRepository.findByIdAndUsuario(req.categoriaId(), usuario).ifPresent(t::setCategoriaEntidade);
        }
        if (req.contaId() != null) {
            contaRepository.findByIdAndUsuario(req.contaId(), usuario).ifPresent(t::setConta);
        }
        return t;
    }

    private LocalDate incrementarData(LocalDate base, Recorrencia recorrencia, int i) {
        return switch (recorrencia) {
            case DIARIA -> base.plusDays(i);
            case SEMANAL -> base.plusWeeks(i);
            case MENSAL -> base.plusMonths(i);
            case ANUAL -> base.plusYears(i);
            default -> base;
        };
    }
}
