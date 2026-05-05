package com.example.alinhamais;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

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

public class LembretesFragment extends Fragment implements LembreteAdapter.OnItemClickListener {

    private RecyclerView recycler;
    private LembreteAdapter adapter;
    private String token;
    private int idPaciente;

    private static final String BASE_URL =
            "https://projeto-interdisciplinar-3.onrender.com";




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

        android.content.SharedPreferences prefs = requireActivity().getSharedPreferences("MayaPrefs", requireActivity().MODE_PRIVATE);
        token      = "Bearer " + prefs.getString("token", "");
        idPaciente = prefs.getInt("id_usuario", 0);

        recycler = view.findViewById(R.id.recyclerLembretes);
        recycler.setLayoutManager(new LinearLayoutManager(requireContext()));

        //carregar lembretes quando subir a tela (atualizar)
        SwipeRefreshLayout swipeRefresh = view.findViewById(R.id.swipeRefresh);

        swipeRefresh.setOnRefreshListener(() -> {
            carregarLembretes();
            swipeRefresh.setRefreshing(false);
        });

        pedirPermissaoNotificacao();

        adapter = new LembreteAdapter(
                this,
                requireContext(),
                new java.util.ArrayList<>(),
                BASE_URL,
                (lembrete, ativo) -> toggleLembrete(lembrete, ativo)
        );

        recycler.setAdapter(adapter);

        carregarLembretes();


        return view;
    }


    //quando clicar em um dos adapters abre o fragment de info dos lembretes
    @Override
    public void onItemClick(LembreteResponse lembrete) {
        Fragment infoFragment = new LembreteInfoFragment();

        Bundle args = new Bundle();
        args.putSerializable("lembrete", lembrete);
        infoFragment.setArguments(args);

        getParentFragmentManager()
                .beginTransaction()
                .replace(R.id.fragmentsFrame, infoFragment)
                .addToBackStack(null)
                .commit();

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
        Log.d("LEMBRETES", "Entrou no carregarLembretes()");
        RetrofitClient.getApiService(requireContext())
                .getLembretesPaciente(idPaciente)
                .enqueue(new Callback<List<LembreteResponse>>() {

                    @Override
                    public void onResponse(Call<List<LembreteResponse>> call,
                                           Response<List<LembreteResponse>> response) {

                        Log.d("LEMBRETES", "onResponse chamado");
                        Log.d("LEMBRETES", "Código: " + response.code());

                        if (!response.isSuccessful()) {
                            try {
                                Log.e("LEMBRETES", "Erro body: " + response.errorBody().string());
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                            return;
                        }

                        if (response.body() == null) {
                            Log.e("LEMBRETES", "Body veio NULL");
                            return;
                        }

                        List<LembreteResponse> lembretes = response.body();

                        Log.d("LEMBRETES", "Quantidade: " + lembretes.size());

                        adapter.atualizarLista(lembretes);


                        LembreteNotificationManager.cancelarTodos(requireContext(), lembretes);


                        for (LembreteResponse l : lembretes) {
                            if (l.getAtivo() == 1) {
                                LembreteNotificationManager.agendar(requireContext(), l);
                            }
                        }
                    }

                    @Override
                    public void onFailure(Call<List<LembreteResponse>> call, Throwable t) {
                        Log.e("LEMBRETES", "Erro na API", t);
                        Toast.makeText(requireContext(),
                                "Erro ao carregar lembretes",
                                Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void toggleLembrete(LembreteResponse lembrete, boolean ativo) {
        Map<String, Integer> body = new HashMap<>();
        body.put("ativo", ativo ? 1 : 0);

        RetrofitClient.getApiService(requireContext())
                .toggleLembrete(token, lembrete.getIdLembrete(), idPaciente, body)
                .enqueue(new Callback<MensagemResponse>() {

                    @Override
                    public void onResponse(Call<MensagemResponse> call,
                                           Response<MensagemResponse> response) {


                        LembreteNotificationManager.cancelar(
                                requireContext(), lembrete.getIdLembrete());

                        if (ativo) {
                            LembreteNotificationManager.agendar(requireContext(), lembrete);
                            Toast.makeText(requireContext(),
                                    "Notificações ativadas!", Toast.LENGTH_SHORT).show();
                        } else {
                            Toast.makeText(requireContext(),
                                    "Notificações desativadas", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<MensagemResponse> call, Throwable t) {
                        Toast.makeText(requireContext(),
                                "Erro ao atualizar lembrete",
                                Toast.LENGTH_SHORT).show();
                    }
                });
    }


}