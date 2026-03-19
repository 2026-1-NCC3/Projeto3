package com.example.alinhamais.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.example.alinhamais.api.RetrofitClient;
import com.example.alinhamais.managers.LembreteNotificationManager;
import com.example.alinhamais.models.LembreteResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

// Reagenda notificações depois que o celular reinicia
public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;

        SharedPreferences prefs = context.getSharedPreferences(
                "MayaPrefs", Context.MODE_PRIVATE);

        String token    = prefs.getString("token", null);
        int idPaciente  = prefs.getInt("id_usuario", 0);

        if (token == null || idPaciente == 0) return;

        // Recarrega lembretes ativos e reagenda
        RetrofitClient.getApiService()
                .getLembretesPaciente("Bearer " + token, idPaciente)
                .enqueue(new Callback<List<LembreteResponse>>() {
                    @Override
                    public void onResponse(Call<List<LembreteResponse>> call,
                                           Response<List<LembreteResponse>> response) {
                        if (!response.isSuccessful() || response.body() == null) return;

                        for (LembreteResponse l : response.body()) {
                            if (l.getAtivo() == 1) {
                                LembreteNotificationManager.agendar(context, l);
                            }
                        }
                    }

                    @Override
                    public void onFailure(Call<List<LembreteResponse>> call, Throwable t) {}
                });
    }
}