package com.example.alinhamais.models;

public class AtualizarPerfilRequest {

    private String email;
    private String telefone;
    private String data_nascimento;

    public AtualizarPerfilRequest(String email, String telefone, String data_nascimento) {
        this.email           = email;
        this.telefone        = telefone;
        this.data_nascimento = data_nascimento;
    }

    public String getEmail()           { return email; }
    public String getTelefone()        { return telefone; }
    public String getData_nascimento() { return data_nascimento; }
}