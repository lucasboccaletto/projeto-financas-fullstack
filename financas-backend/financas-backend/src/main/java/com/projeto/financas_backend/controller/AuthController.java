package com.projeto.financas_backend.controller;

import com.projeto.financas_backend.model.LoginRequest;
import com.projeto.financas_backend.model.Usuario;
import com.projeto.financas_backend.repository.UsuarioRepository;
import com.projeto.financas_backend.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        System.out.println("TENTATIVA DE LOGIN - Usuário: " + request.getUsername());
        
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = jwtService.generateToken(request.getUsername());
        return ResponseEntity.ok(token);
    }

    // NOVA ROTA: Recebe os dados, criptografa a senha e salva no banco
    @PostMapping("/registrar")
    public ResponseEntity<String> registrar(@RequestBody LoginRequest request) {
        System.out.println("TENTATIVA DE CADASTRO - Usuário: " + request.getUsername());

        // 1. Verifica se o usuário já existe no banco
        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Erro: Nome de usuário já está em uso.");
        }

        // 2. Prepara o novo usuário
        Usuario novoUsuario = new Usuario();
        novoUsuario.setUsername(request.getUsername());
        // 3. Criptografa a senha antes de salvar!
        novoUsuario.setPassword(passwordEncoder.encode(request.getPassword()));

        // 4. Salva no banco de dados
        usuarioRepository.save(novoUsuario);

        return ResponseEntity.ok("Usuário cadastrado com sucesso!");
    }
}