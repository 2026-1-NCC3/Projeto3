package com.example.alinhamais.models;

public class LoginRequest {
    private String email;
    private String senha;

    public LoginRequest(String email, String senha) {
        this.email = email;
        this.senha = senha;
    }
}