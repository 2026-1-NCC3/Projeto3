package com.example.alinhamais.managers;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.example.alinhamais.models.LembreteResponse;
import com.example.alinhamais.receivers.LembreteAlarmReceiver;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

public class LembreteNotificationManager {

    // Agenda todos os alarmes de um lembrete
    public static void agendar(Context context, LembreteResponse lembrete) {
        cancelar(context, lembrete.getIdLembrete());

        List<int[]> horarios = calcularHorarios(
                lembrete.getHorarioInicio(),
                lembrete.getHorarioFim(),
                lembrete.getIntervaloMinutos()
        );

        AlarmManager alarmManager =
                (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        Log.d("LEMBRETE", "Agendando: " + lembrete.getTitulo());
        Log.d("LEMBRETE", "Qtd horários: " + horarios.size());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                Log.w("LEMBRETE", "Permissão de alarme exato NÃO concedida");
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
                return;
            }
        }


        int agendados = 0;
        int limite = 5; // evita estourar 500 alarmes

        long agora = System.currentTimeMillis();

        for (int i = 0; i < horarios.size(); i++) {
            if (agendados >= limite) break;

            int hora   = horarios.get(i)[0];
            int minuto = horarios.get(i)[1];

            Calendar calendario = Calendar.getInstance();
            calendario.set(Calendar.HOUR_OF_DAY, hora);
            calendario.set(Calendar.MINUTE, minuto);
            calendario.set(Calendar.SECOND, 0);
            calendario.set(Calendar.MILLISECOND, 0);

            long triggerTime = calendario.getTimeInMillis();


            if (triggerTime <= agora) {
                continue;
            }

            Log.d("LEMBRETE", "Agendado para: " + hora + ":" + minuto);

            Intent intent = new Intent(context, LembreteAlarmReceiver.class);
            intent.putExtra(LembreteAlarmReceiver.EXTRA_TITULO, lembrete.getTitulo());
            intent.putExtra(LembreteAlarmReceiver.EXTRA_DESCRICAO, lembrete.getDescricao());
            intent.putExtra(LembreteAlarmReceiver.EXTRA_ID, lembrete.getIdLembrete());

            int requestCode = lembrete.getIdLembrete() * 1000 + i;

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerTime,
                        pendingIntent
                );
            } else {
                alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        triggerTime,
                        pendingIntent
                );
            }

            agendados++;
        }
    }

    // Cancela todos os alarmes de um lembrete
    public static void cancelar(Context context, int idLembrete) {
        AlarmManager alarmManager =
                (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        for (int i = 0; i < 100; i++) {
            Intent intent = new Intent(context, LembreteAlarmReceiver.class);

            int requestCode = idLembrete * 1000 + i;

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
            );

            if (pendingIntent != null) {
                alarmManager.cancel(pendingIntent);
                pendingIntent.cancel();
            }
        }
    }

    // Cancela todos os lembretes
    public static void cancelarTodos(Context context, List<LembreteResponse> lembretes) {
        for (LembreteResponse l : lembretes) {
            cancelar(context, l.getIdLembrete());
        }
    }

    // Calcula horários entre início e fim com intervalo
    public static List<int[]> calcularHorarios(String inicio, String fim, int intervaloMinutos) {
        List<int[]> horarios = new ArrayList<>();

        if (inicio == null || fim == null || intervaloMinutos <= 0) return horarios;

        try {
            String[] partsInicio = inicio.split(":");
            String[] partsFim    = fim.split(":");

            int inicioMin = Integer.parseInt(partsInicio[0]) * 60
                    + Integer.parseInt(partsInicio[1]);
            int fimMin    = Integer.parseInt(partsFim[0]) * 60
                    + Integer.parseInt(partsFim[1]);

            for (int min = inicioMin; min <= fimMin; min += intervaloMinutos) {
                horarios.add(new int[]{ min / 60, min % 60 });
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return horarios;
    }
}