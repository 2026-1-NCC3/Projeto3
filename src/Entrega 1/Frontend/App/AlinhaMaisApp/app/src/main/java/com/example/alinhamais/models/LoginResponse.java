package com.example.alinhamais.models;

public class LoginResponse {
    private String mensagem;
    private String token;
    private UsuarioInfo usuario;

    public String getToken() { return token; }
    public String getMensagem() { return mensagem; }
    public UsuarioInfo getUsuario() { return usuario; }

    public static class UsuarioInfo {
        private int id;
        private String nome;
        private String email;
        private String perfil;

        public int getId() { return id; }
        public String getNome() { return nome; }
        public String getEmail() { return email; }
        public String getPerfil() { return perfil; }
    }
}