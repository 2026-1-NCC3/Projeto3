package com.example.alinhamais.models;

public class NotificacaoResponse {
    private int id_notificacao;
    private String titulo;
    private String mensagem;
    private String data_envio;
    private String status;

    public int getId_notificacao() {
        return id_notificacao;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getMensagem() {
        return mensagem;
    }

    public String getData_envio() {
        return data_envio;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}