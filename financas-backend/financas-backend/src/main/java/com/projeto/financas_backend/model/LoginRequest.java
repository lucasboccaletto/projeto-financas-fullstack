package com.projeto.financas_backend.model;

public class LoginRequest {
    private String username;
    private String password;

    // Criando os Getters e Setters na mão para evitar falhas do Lombok
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}