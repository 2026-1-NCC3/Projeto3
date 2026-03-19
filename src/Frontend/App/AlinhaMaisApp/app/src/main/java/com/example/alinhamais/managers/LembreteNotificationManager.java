package com.example.alinhamais.managers;

import android.content.Context;

import androidx.work.Data;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import com.example.alinhamais.models.LembreteResponse;
import com.example.alinhamais.workers.LembreteWorker;

import java.util.concurrent.TimeUnit;

public class LembreteNotificationManager {

    // Agenda notificação periódica para um lembrete
    public static void agendar(Context context, LembreteResponse lembrete) {
        int intervalo = lembrete.getIntervaloMinutos();
        if (intervalo <= 0) intervalo = 60;
        if (intervalo < 15) intervalo = 15;

        Data data = new Data.Builder()
                .putString(LembreteWorker.KEY_TITULO,         lembrete.getTitulo())
                .putString(LembreteWorker.KEY_DESCRICAO,      lembrete.getDescricao())
                .putInt(LembreteWorker.KEY_ID,                lembrete.getIdLembrete())
                .putString(LembreteWorker.KEY_HORARIO_INICIO, lembrete.getHorarioInicio()) // ← novo
                .putString(LembreteWorker.KEY_HORARIO_FIM,    lembrete.getHorarioFim())    // ← novo
                .build();

        PeriodicWorkRequest work = new PeriodicWorkRequest.Builder(
                LembreteWorker.class, intervalo, TimeUnit.MINUTES)
                .setInputData(data)
                .addTag("lembrete_" + lembrete.getIdLembrete())
                .build();

        WorkManager.getInstance(context)
                .enqueueUniquePeriodicWork(
                        "lembrete_" + lembrete.getIdLembrete(),
                        androidx.work.ExistingPeriodicWorkPolicy.REPLACE,
                        work
                );
    }

    // Cancela notificação de um lembrete
    public static void cancelar(Context context, int idLembrete) {
        WorkManager.getInstance(context)
                .cancelUniqueWork("lembrete_" + idLembrete);
    }

    // Cancela todas as notificações
    public static void cancelarTodos(Context context) {
        WorkManager.getInstance(context).cancelAllWork();
    }
}