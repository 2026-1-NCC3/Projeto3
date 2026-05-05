package com.example.alinhamais.receivers;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.example.alinhamais.R;
import com.example.alinhamais.managers.LembreteNotificationManager;

public class LembreteAlarmReceiver extends BroadcastReceiver {

    public static final String CHANNEL_ID    = "maya_lembretes";
    public static final String EXTRA_TITULO  = "titulo";
    public static final String EXTRA_DESCRICAO = "descricao";
    public static final String EXTRA_ID      = "id_lembrete";

    @Override
    public void onReceive(Context context, Intent intent) {
        String titulo    = intent.getStringExtra(EXTRA_TITULO);
        String descricao = intent.getStringExtra(EXTRA_DESCRICAO);
        int    id        = intent.getIntExtra(EXTRA_ID, 0);

        criarCanal(context);
        enviarNotificacao(context, titulo, descricao, id);
    }

    private void criarCanal(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel canal = new NotificationChannel(
                    CHANNEL_ID,
                    "Lembretes Maya RPG",
                    NotificationManager.IMPORTANCE_HIGH
            );
            canal.setDescription("Lembretes de postura e saúde");
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            manager.createNotificationChannel(canal);
        }
    }

    private void enviarNotificacao(Context context, String titulo,
                                   String descricao, int id) {
        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(context, CHANNEL_ID)
                        .setSmallIcon(R.drawable.sem_notificacao)
                        .setContentTitle(titulo)
                        .setContentText(descricao)
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setAutoCancel(true);

        NotificationManager manager = (NotificationManager)
                context.getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(id * 1000 + (int)(System.currentTimeMillis() % 1000), builder.build());
    }
}