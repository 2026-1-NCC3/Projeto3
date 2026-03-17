package com.example.alinhamais.models;

import com.google.gson.annotations.SerializedName;

public class MeResponse {
    private int id_usuario;
    private String nome;
    private String email;
    private String perfil;
    private String telefone;

    @SerializedName("data_nascimento")
    private String dataNascimento;

    public int getIdUsuario()         { return id_usuario; }
    public String getNome()           { return nome; }
    public String getEmail()          { return email; }
    public String getPerfil()         { return perfil; }
    public String getTelefone()       { return telefone; }
    public String getDataNascimento() { return dataNascimento; }
}