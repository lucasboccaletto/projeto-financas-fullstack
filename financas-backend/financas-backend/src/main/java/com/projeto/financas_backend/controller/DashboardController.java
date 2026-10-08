package com.projeto.financas_backend.controller;

import com.projeto.financas_backend.model.*;
import com.projeto.financas_backend.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final TransacaoRepository transacaoRepository;
    private final ContaRepository contaRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardController(TransacaoRepository transacaoRepository, ContaRepository contaRepository,
                                UsuarioRepository usuarioRepository) {
        this.transacaoRepository = transacaoRepository;
        this.contaRepository = contaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario getUsuario(Authentication auth) {
        return usuarioRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @GetMapping("/resumo")
    public Map<String, Object> resumo(
            Authentication auth,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano
    ) {
        Usuario usuario = getUsuario(auth);
        LocalDate now = LocalDate.now();
        int m = mes != null ? mes : now.getMonthValue();
        int y = ano != null ? ano : now.getYear();
        LocalDate inicio = LocalDate.of(y, m, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        BigDecimal receitas = transacaoRepository.sumReceitasByPeriodo(usuario, inicio, fim);
        BigDecimal despesas = transacaoRepository.sumDespesasByPeriodo(usuario, inicio, fim);

        List<Conta> contas = contaRepository.findByUsuarioAndAtivaTrue(usuario);
        BigDecimal saldoTotal = BigDecimal.ZERO;
        for (Conta c : contas) {
            saldoTotal = saldoTotal.add(c.getSaldoInicial());
        }
        List<Transacao> todasTransacoes = transacaoRepository.findByUsuario(usuario);
        for (Transacao t : todasTransacoes) {
            if (t.getTipo() == TipoTransacao.RECEITA) {
                saldoTotal = saldoTotal.add(t.getValor());
            } else if (t.getTipo() == TipoTransacao.DESPESA) {
                saldoTotal = saldoTotal.subtract(t.getValor());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("receitas", receitas);
        result.put("despesas", despesas);
        result.put("saldo", receitas.subtract(despesas));
        result.put("saldoTotal", saldoTotal);
        result.put("mes", m);
        result.put("ano", y);
        return result;
    }

    @GetMapping("/grafico/mensal")
    public List<Map<String, Object>> graficoMensal(Authentication auth, @RequestParam(defaultValue = "6") int meses) {
        Usuario usuario = getUsuario(auth);
        LocalDate now = LocalDate.now();
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (int i = meses - 1; i >= 0; i--) {
            LocalDate ref = now.minusMonths(i);
            LocalDate inicio = ref.withDayOfMonth(1);
            LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());
            BigDecimal receitas = transacaoRepository.sumReceitasByPeriodo(usuario, inicio, fim);
            BigDecimal despesas = transacaoRepository.sumDespesasByPeriodo(usuario, inicio, fim);

            Map<String, Object> ponto = new LinkedHashMap<>();
            ponto.put("mes", ref.getMonth().toString().substring(0, 3));
            ponto.put("ano", ref.getYear());
            ponto.put("receitas", receitas);
            ponto.put("despesas", despesas);
            resultado.add(ponto);
        }
        return resultado;
    }

    @GetMapping("/grafico/categorias")
    public List<Map<String, Object>> graficoCategorias(
            Authentication auth,
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer ano
    ) {
        Usuario usuario = getUsuario(auth);
        LocalDate now = LocalDate.now();
        int m = mes != null ? mes : now.getMonthValue();
        int y = ano != null ? ano : now.getYear();
        LocalDate inicio = LocalDate.of(y, m, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        List<Transacao> transacoes = transacaoRepository.findAll(
                TransacaoSpec.filter(usuario, TipoTransacao.DESPESA, null, null, null, inicio, fim, null)
        );

        Map<String, BigDecimal> porCategoria = new LinkedHashMap<>();
        for (Transacao t : transacoes) {
            String cat = t.getCategoriaEntidade() != null ? t.getCategoriaEntidade().getNome()
                    : (t.getCategoria() != null ? t.getCategoria() : "Sem categoria");
            porCategoria.merge(cat, t.getValor(), BigDecimal::add);
        }

        List<Map<String, Object>> resultado = new ArrayList<>();
        porCategoria.forEach((cat, total) -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("categoria", cat);
            item.put("total", total);
            resultado.add(item);
        });
        resultado.sort((a, b) -> ((BigDecimal) b.get("total")).compareTo((BigDecimal) a.get("total")));
        return resultado;
    }
}
