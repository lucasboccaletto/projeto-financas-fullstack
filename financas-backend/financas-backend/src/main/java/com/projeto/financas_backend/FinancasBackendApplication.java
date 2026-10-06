package com.projeto.financas_backend;

import com.projeto.financas_backend.model.Usuario;
import com.projeto.financas_backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class FinancasBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinancasBackendApplication.class, args);
    }

    // Este código vai rodar sozinho toda vez que você der "Run" no projeto
    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verifica se o usuário 'lucas' já existe. Se não, o Java cria e criptografa a senha do jeito certo!
            if (usuarioRepository.findByUsername("admin_lucas").isEmpty()) {
                Usuario novoUsuario = new Usuario();
                novoUsuario.setUsername("admin_lucas");
                // Aqui está o segredo: deixamos o próprio Spring Security embaralhar a senha
                novoUsuario.setPassword(passwordEncoder.encode("Projeto@2026")); 
                
                usuarioRepository.save(novoUsuario);
                
                System.out.println("=========================================");
                System.out.println("NOVO USUÁRIO CRIADO COM SUCESSO!");
                System.out.println("=========================================");
            }
        };
    }
}