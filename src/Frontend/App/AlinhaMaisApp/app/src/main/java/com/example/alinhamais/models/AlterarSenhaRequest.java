package com.example.alinhamais.models;

import com.google.gson.annotations.SerializedName;

public class AlterarSenhaRequest {
    @SerializedName("senha_atual")
    private String senhaAtual;

    @SerializedName("nova_senha")
    private String novaSenha;

    public AlterarSenhaRequest(String senhaAtual, String novaSenha) {
        this.senhaAtual = senhaAtual;
        this.novaSenha  = novaSenha;
    }
}