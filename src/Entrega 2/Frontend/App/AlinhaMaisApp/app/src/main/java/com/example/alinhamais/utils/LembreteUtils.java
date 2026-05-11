package com.example.alinhamais.utils;

import com.example.alinhamais.R;

public class LembreteUtils {

    public static int getImagemPorHorario(String horarioInicio, String horarioFim) {
        if (horarioInicio == null || horarioFim == null) return R.drawable.sem_notificacao;

        int horaInicio = Integer.parseInt(horarioInicio.split(":")[0]);
        int horaFim    = Integer.parseInt(horarioFim.split(":")[0]);

        boolean manha = (horaInicio >= 6 && horaInicio < 12) || (horaFim >= 6 && horaFim < 12);
        boolean tarde = (horaInicio >= 12 && horaInicio < 18) || (horaFim >= 12 && horaFim < 18);
        boolean tardeMN = (horaInicio <18 && (horaFim > 12 || horaFim < 6));
        boolean noite = (horaInicio >= 18 || horaInicio < 6) || (horaFim >= 18 || horaFim < 6);

        if (manha && noite && tardeMN) return R.drawable.imagem_lembrete_manha_tarde_noite;
        if (manha && tarde)          return R.drawable.imagem_lembrete_manha_tarde;
        if (manha && noite)          return R.drawable.imagem_lembrete_manha_noite;
        if (tarde && noite)          return R.drawable.imagem_lembrete_tarde_noite;
        if (manha)                   return R.drawable.imagem_lembrete_manha;
        if (tarde)                   return R.drawable.imagem_lembrete_tarde;
        if (noite)                   return R.drawable.imagem_lembrete_noite;

        return R.drawable.sem_notificacao;
    }
}