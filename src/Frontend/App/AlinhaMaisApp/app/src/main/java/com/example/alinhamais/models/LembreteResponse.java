package com.example.alinhamais.models;

import com.google.gson.annotations.SerializedName;

public class LembreteResponse {
    private int id_lembrete;
    private String titulo;
    private String descricao;
    private String foto;
    private int ativo;

    @SerializedName("intervalo_minutos")
    private int intervaloMinutos;

    @SerializedName("horario_inicio")
    private String horarioInicio;

    @SerializedName("horario_fim")
    private String horarioFim;

    public int getIdLembrete()        { return id_lembrete; }
    public String getTitulo()         { return titulo; }
    public String getDescricao()      { return descricao; }
    public String getFoto()           { return foto; }
    public int getAtivo()             { return ativo; }
    public int getIntervaloMinutos()  { return intervaloMinutos; }
    public String getHorarioInicio()  { return horarioInicio; }
    public String getHorarioFim()     { return horarioFim; }
    public void setAtivo(int ativo)   { this.ativo = ativo; }
}