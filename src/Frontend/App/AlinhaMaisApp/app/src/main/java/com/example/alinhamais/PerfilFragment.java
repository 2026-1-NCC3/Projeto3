package com.example.alinhamais;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.fragment.app.Fragment;

public class PerfilFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_perfil, container, false);

        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MayaPrefs", requireActivity().MODE_PRIVATE);

        String nome           = prefs.getString("nome", "Usuário");
        String email          = prefs.getString("email", "");
        String telefone       = prefs.getString("telefone", "Não informado");
        String dataNascimento = prefs.getString("data_nascimento", "Não informada");
        String idLogin        = prefs.getString("id_login", "");
        int    id             = prefs.getInt("id_usuario", 0);

        view.<TextView>findViewById(R.id.tvNome).setText(nome);
        view.<TextView>findViewById(R.id.tvId).setText("ID: " + id);
        view.<TextView>findViewById(R.id.tvEmail).setText("Email: " + email);
        view.<TextView>findViewById(R.id.tvTelefone).setText("Telefone: " + telefone);
        view.<TextView>findViewById(R.id.tvDataNascimento).setText("Nascimento: " + dataNascimento);

        // Mostra o código de acesso se existir
        TextView tvIdLogin = view.findViewById(R.id.tvIdLogin);
        if (tvIdLogin != null) {
            tvIdLogin.setText("Código de Acesso: " + idLogin);
        }

        // Botão Logout
        Button btnLogout = view.findViewById(R.id.btnLogout);
        btnLogout.setOnClickListener(v -> {
            prefs.edit().clear().apply();
            Intent intent = new Intent(requireActivity(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }
}