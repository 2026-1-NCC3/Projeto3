package com.example.alinhamais;

import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.fragment.app.Fragment;

import com.example.alinhamais.api.RetrofitClient;
import com.example.alinhamais.models.AtualizarPerfilRequest;
import com.example.alinhamais.models.MensagemResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PerfilFragment extends Fragment {

    private TextView tvEmail;
    private TextView tvTelefone;
    private TextView tvDataNascimento;

    private String emailAtual;
    private String telefoneAtual;
    private String dataNascimentoAtual;

    private SharedPreferences prefs;
    private int idUsuario;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_perfil, container, false);

        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MayaPrefs", requireActivity().MODE_PRIVATE);

        String nome       = prefs.getString("nome", "Usuário");
        emailAtual        = prefs.getString("email", "");
        telefoneAtual     = prefs.getString("telefone", "Não informado");
        dataNascimentoAtual = prefs.getString("data_nascimento", "Não informada");
        String idLogin    = prefs.getString("id_login", "");
        idUsuario         = prefs.getInt("id_usuario", 0);

        view.<TextView>findViewById(R.id.tvNome).setText(nome);
        view.<TextView>findViewById(R.id.tvId).setText("ID: " + idUsuario);

        tvEmail           = view.findViewById(R.id.tvEmail);
        tvTelefone        = view.findViewById(R.id.tvTelefone);
        tvDataNascimento  = view.findViewById(R.id.tvDataNascimento);

        tvEmail.setText("Email: " + emailAtual);
        tvTelefone.setText("Telefone: " + telefoneAtual);
        tvDataNascimento.setText("Nascimento: " + dataNascimentoAtual);

        TextView tvIdLogin = view.findViewById(R.id.tvIdLogin);
        if (tvIdLogin != null) {
            tvIdLogin.setText("Código de Acesso: " + idLogin);
        }

        ImageButton btnEditEmail = view.findViewById(R.id.btnEditEmail);
        btnEditEmail.setOnClickListener(v ->
                abrirDialogEdicao("Email", emailAtual, "novo_email@exemplo.com", "email")
        );

        ImageButton btnEditTelefone = view.findViewById(R.id.btnEditTelefone);
        btnEditTelefone.setOnClickListener(v ->
                abrirDialogEdicao("Telefone", telefoneAtual, "(11) 99999-9999", "telefone")
        );

        ImageButton btnEditDataNascimento = view.findViewById(R.id.btnEditDataNascimento);
        btnEditDataNascimento.setOnClickListener(v ->
                abrirDialogEdicao("Data de Nascimento", dataNascimentoAtual, "AAAA-MM-DD", "data_nascimento")
        );

        Button btnLogout = view.findViewById(R.id.btnLogout);
        btnLogout.setOnClickListener(v -> {
            prefs.edit().clear().apply();
            Intent intent = new Intent(requireActivity(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }
    private void abrirDialogEdicao(String campo, String valorAtual, String hint, String chavePrefs) {
        EditText input = new EditText(requireContext());
        input.setText(valorAtual);
        input.setHint(hint);
        input.setPadding(48, 24, 48, 24);

        new AlertDialog.Builder(requireContext())
                .setTitle("Editar " + campo)
                .setView(input)
                .setPositiveButton("Salvar", (dialog, which) -> {
                    String novoValor = input.getText().toString().trim();

                    if (novoValor.isEmpty()) {
                        Toast.makeText(requireContext(), "O campo não pode ficar vazio.", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    if (chavePrefs.equals("email"))           emailAtual = novoValor;
                    if (chavePrefs.equals("telefone"))        telefoneAtual = novoValor;
                    if (chavePrefs.equals("data_nascimento")) dataNascimentoAtual = novoValor;

                    enviarAtualizacao(chavePrefs, novoValor);
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void enviarAtualizacao(String chavePrefs, String novoValor) {
        AtualizarPerfilRequest body = new AtualizarPerfilRequest(
                emailAtual,
                telefoneAtual,
                dataNascimentoAtual
        );

        RetrofitClient.getApiService(requireContext())
                .atualizarPerfil("Bearer " + prefs.getString("token", ""), idUsuario, body)
                .enqueue(new Callback<MensagemResponse>() {

                    @Override
                    public void onResponse(Call<MensagemResponse> call, Response<MensagemResponse> response) {
                        if (response.isSuccessful()) {
                            prefs.edit().putString(chavePrefs, novoValor).apply();

                            if (chavePrefs.equals("email"))           tvEmail.setText("Email: " + novoValor);
                            if (chavePrefs.equals("telefone"))        tvTelefone.setText("Telefone: " + novoValor);
                            if (chavePrefs.equals("data_nascimento")) tvDataNascimento.setText("Nascimento: " + novoValor);

                            Toast.makeText(requireContext(), "Salvo com sucesso!", Toast.LENGTH_SHORT).show();
                        } else {
                            Toast.makeText(requireContext(), "Erro ao salvar. Tente novamente.", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<MensagemResponse> call, Throwable t) {
                        Toast.makeText(requireContext(), "Sem conexão com o servidor.", Toast.LENGTH_SHORT).show();
                    }
                });
    }
}
