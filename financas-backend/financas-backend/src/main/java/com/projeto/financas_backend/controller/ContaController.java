package com.projeto.financas_backend.controller;

import com.projeto.financas_backend.model.Conta;
import com.projeto.financas_backend.model.Transacao;
import com.projeto.financas_backend.model.TipoTransacao;
import com.projeto.financas_backend.model.Usuario;
import com.projeto.financas_backend.repository.ContaRepository;
import com.projeto.financas_backend.repository.TransacaoRepository;
import com.projeto.financas_backend.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contas")
public class ContaController {

    private final ContaRepository contaRepository;
    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public ContaController(ContaRepository contaRepository, TransacaoRepository transacaoRepository, UsuarioRepository usuarioRepository) {
        this.contaRepository = contaRepository;
        this.transacaoRepository = transacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario getUsuario(Authentication auth) {
        return usuarioRepository.findByUsername(auth.getName()).orElseThrow();
    }

    @GetMapping
    public List<Conta> listar(Authentication auth) {
        return contaRepository.findByUsuarioAndAtivaTrue(getUsuario(auth));
    }

    @GetMapping("/{id}/saldo")
    public ResponseEntity<Map<String, Object>> getSaldo(@PathVariable Long id, Authentication auth) {
        Usuario usuario = getUsuario(auth);
        return contaRepository.findByIdAndUsuario(id, usuario)
                .map(conta -> {
                    List<Transacao> transacoes = transacaoRepository.findByUsuario(usuario);
                    BigDecimal saldo = conta.getSaldoInicial();
                    for (Transacao t : transacoes) {
                        if (t.getConta() != null && t.getConta().getId().equals(id)) {
                            if (t.getTipo() == TipoTransacao.RECEITA) {
                                saldo = saldo.add(t.getValor());
                            } else if (t.getTipo() == TipoTransacao.DESPESA) {
                                saldo = saldo.subtract(t.getValor());
                            }
                        }
                    }
                    Map<String, Object> result = new HashMap<>();
                    result.put("saldo", saldo);
                    result.put("conta", conta);
                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Conta> criar(@RequestBody Conta conta, Authentication auth) {
        conta.setUsuario(getUsuario(auth));
        return ResponseEntity.ok(contaRepository.save(conta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Conta> atualizar(@PathVariable Long id, @RequestBody Conta dados, Authentication auth) {
        return contaRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(c -> {
                    c.setNome(dados.getNome());
                    c.setTipo(dados.getTipo());
                    c.setSaldoInicial(dados.getSaldoInicial());
                    c.setCor(dados.getCor());
                    c.setIcone(dados.getIcone());
                    c.setLimite(dados.getLimite());
                    c.setDiaFechamento(dados.getDiaFechamento());
                    c.setDiaVencimento(dados.getDiaVencimento());
                    return ResponseEntity.ok(contaRepository.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication auth) {
        return contaRepository.findByIdAndUsuario(id, getUsuario(auth))
                .map(c -> {
                    c.setAtiva(false);
                    contaRepository.save(c);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
