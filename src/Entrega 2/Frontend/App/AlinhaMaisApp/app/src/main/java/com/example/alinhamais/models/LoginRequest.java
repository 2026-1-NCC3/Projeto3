package com.example.alinhamais.models;

public class LoginRequest {
    private String cpf;
    private String id_login;

    public LoginRequest(String cpf, String id_login) {
        this.cpf      = cpf;
        this.id_login = id_login;
    }
}