package com.example.alinhamais.workers;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.example.alinhamais.R;

import java.util.Calendar;

public class LembreteWorker extends Worker {

    public static final String KEY_TITULO         = "titulo";
    public static final String KEY_DESCRICAO      = "descricao";
    public static final String KEY_ID             = "id_lembrete";
    public static final String KEY_HORARIO_INICIO = "horario_inicio";
    public static final String KEY_HORARIO_FIM    = "horario_fim";
    public static final String CHANNEL_ID         = "maya_lembretes";

    public LembreteWorker(@NonNull Context context,
                          @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        String titulo        = getInputData().getString(KEY_TITULO);
        String descricao     = getInputData().getString(KEY_DESCRICAO);
        int    id            = getInputData().getInt(KEY_ID, 0);
        String horarioInicio = getInputData().getString(KEY_HORARIO_INICIO);
        String horarioFim    = getInputData().getString(KEY_HORARIO_FIM);

        // Verifica se está dentro do horário permitido
        if (!dentroDoHorario(horarioInicio, horarioFim)) {
            return Result.success(); // Fora do horário, não notifica
        }

        criarCanal();
        enviarNotificacao(titulo, descricao, id);

        return Result.success();
    }

    private boolean dentroDoHorario(String inicio, String fim) {
        if (inicio == null || fim == null) return true; // sem restrição

        try {
            // Pega hora atual do aparelho
            Calendar agora = Calendar.getInstance();
            int horaAtual  = agora.get(Calendar.HOUR_OF_DAY);
            int minAtual   = agora.get(Calendar.MINUTE);

            // Converte "07:00" para horas e minutos
            String[] partsInicio = inicio.split(":");
            String[] partsFim    = fim.split(":");

            int horaInicio = Integer.parseInt(partsInicio[0]);
            int minInicio  = Integer.parseInt(partsInicio[1]);
            int horaFim    = Integer.parseInt(partsFim[0]);
            int minFim     = Integer.parseInt(partsFim[1]);

            // Converte tudo para minutos para facilitar comparação
            int agora_min  = horaAtual  * 60 + minAtual;
            int inicio_min = horaInicio * 60 + minInicio;
            int fim_min    = horaFim    * 60 + minFim;

            return agora_min >= inicio_min && agora_min <= fim_min;

        } catch (Exception e) {
            return true; // Se der erro na conversão, notifica mesmo assim
        }
    }

    private void criarCanal() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel canal = new NotificationChannel(
                    CHANNEL_ID,
                    "Lembretes Maya RPG",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            canal.setDescription("Lembretes de postura e saúde");
            NotificationManager manager = getApplicationContext()
                    .getSystemService(NotificationManager.class);
            manager.createNotificationChannel(canal);
        }
    }

    private void enviarNotificacao(String titulo, String descricao, int id) {
        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(getApplicationContext(), CHANNEL_ID)
                        .setSmallIcon(R.drawable.sem_notificacao)
                        .setContentTitle(titulo)
                        .setContentText(descricao)
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                        .setAutoCancel(true);

        NotificationManager manager = (NotificationManager)
                getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(id, builder.build());
    }
}