package com.example.alinhamais;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.work.WorkInfo;
import androidx.work.WorkManager;

import com.example.alinhamais.adapters.LembreteAdapter;
import com.example.alinhamais.api.RetrofitClient;
import com.example.alinhamais.managers.LembreteNotificationManager;
import com.example.alinhamais.models.LembreteResponse;
import com.example.alinhamais.models.MensagemResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LembretesFragment extends Fragment {

    private RecyclerView recycler;
    private LembreteAdapter adapter;
    private String token;
    private int idPaciente;
    private static final String BASE_URL = "https://projeto-interdisciplinar-3.onrender.com";

    private final ActivityResultLauncher<String> permissaoLauncher =
            registerForActivityResult(
                    new ActivityResultContracts.RequestPermission(),
                    granted -> {
                        if (!granted) {
                            Toast.makeText(requireContext(),
                                    "Permissão de notificação negada",
                                    Toast.LENGTH_SHORT).show();
                        }
                    }
            );

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_lembretes, container, false);

        android.content.SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MayaPrefs", requireActivity().MODE_PRIVATE);
        token      = "Bearer " + prefs.getString("token", "");
        idPaciente = prefs.getInt("id_usuario", 0);

        recycler = view.findViewById(R.id.recyclerLembretes);
        recycler.setLayoutManager(new LinearLayoutManager(requireContext()));

        pedirPermissaoNotificacao();
        carregarLembretes();

        return view;
    }

    private void pedirPermissaoNotificacao() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(requireContext(),
                    Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                permissaoLauncher.launch(Manifest.permission.POST_NOTIFICATIONS);
            }
        }
    }

    private void carregarLembretes() {
        RetrofitClient.getApiService()
                .getLembretesPaciente(token, idPaciente)
                .enqueue(new Callback<List<LembreteResponse>>() {

                    @Override
                    public void onResponse(Call<List<LembreteResponse>> call,
                                           Response<List<LembreteResponse>> response) {
                        if (!response.isSuccessful() || response.body() == null) return;

                        List<LembreteResponse> lembretes = response.body();
                        WorkManager wm = WorkManager.getInstance(requireContext());

                        for (LembreteResponse l : lembretes) {
                            if (l.getAtivo() == 1) {
                                // Só agenda se ainda não tiver Worker rodando
                                wm.getWorkInfosByTag("lembrete_" + l.getIdLembrete())
                                        .addListener(() -> {
                                            try {
                                                List<WorkInfo> infos = wm
                                                        .getWorkInfosByTag("lembrete_" + l.getIdLembrete())
                                                        .get();

                                                boolean jaAgendado = false;
                                                for (WorkInfo info : infos) {
                                                    if (info.getState() == WorkInfo.State.ENQUEUED ||
                                                            info.getState() == WorkInfo.State.RUNNING) {
                                                        jaAgendado = true;
                                                        break;
                                                    }
                                                }

                                                if (!jaAgendado) {
                                                    LembreteNotificationManager.agendar(
                                                            requireContext(), l);
                                                }

                                            } catch (Exception e) {
                                                e.printStackTrace();
                                            }
                                        }, new Handler(Looper.getMainLooper())::post);
                            }
                        }

                        adapter = new LembreteAdapter(
                                requireContext(), lembretes, BASE_URL,
                                (lembrete, ativo) -> toggleLembrete(lembrete, ativo)
                        );
                        recycler.setAdapter(adapter);
                    }

                    @Override
                    public void onFailure(Call<List<LembreteResponse>> call, Throwable t) {
                        Toast.makeText(requireContext(),
                                "Erro ao carregar lembretes", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void toggleLembrete(LembreteResponse lembrete, boolean ativo) {
        Map<String, Integer> body = new HashMap<>();
        body.put("ativo", ativo ? 1 : 0);

        RetrofitClient.getApiService()
                .toggleLembrete(token, lembrete.getIdLembrete(), idPaciente, body)
                .enqueue(new Callback<MensagemResponse>() {

                    @Override
                    public void onResponse(Call<MensagemResponse> call,
                                           Response<MensagemResponse> response) {
                        if (ativo) {
                            LembreteNotificationManager.agendar(requireContext(), lembrete);
                            Toast.makeText(requireContext(),
                                    "Notificações ativadas!", Toast.LENGTH_SHORT).show();
                        } else {
                            LembreteNotificationManager.cancelar(
                                    requireContext(), lembrete.getIdLembrete());
                            Toast.makeText(requireContext(),
                                    "Notificações desativadas", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<MensagemResponse> call, Throwable t) {
                        Toast.makeText(requireContext(),
                                "Erro ao atualizar lembrete", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}