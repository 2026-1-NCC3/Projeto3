package com.example.alinhamais.models;

import com.google.gson.annotations.SerializedName;

public class CadastroRequest {
    private String nome;
    private String email;
    private String senha;
    private String telefone;

    @SerializedName("data_nascimento")
    private String dataNascimento;

    public CadastroRequest(String nome, String email, String senha,
                           String telefone, String dataNascimento) {
        this.nome           = nome;
        this.email          = email;
        this.senha          = senha;
        this.telefone       = telefone;
        this.dataNascimento = dataNascimento;
    }
}