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

        String nome            = prefs.getString("nome", "Usuário");
        String email           = prefs.getString("email", "");
        String telefone        = prefs.getString("telefone", "Não informado");
        String dataNascimento  = prefs.getString("data_nascimento", "Não informada");
        int    id              = prefs.getInt("id_usuario", 0);

        TextView tvNome           = view.findViewById(R.id.tvNome);
        TextView tvId             = view.findViewById(R.id.tvId);
        TextView tvEmail          = view.findViewById(R.id.tvEmail);
        TextView tvTelefone       = view.findViewById(R.id.tvTelefone);
        TextView tvDataNascimento = view.findViewById(R.id.tvDataNascimento);

        tvNome.setText(nome);
        tvId.setText("ID: " + id);
        tvEmail.setText("Email: " + email);
        tvTelefone.setText("Telefone: " + telefone);
        tvDataNascimento.setText("Nascimento: " + dataNascimento);

        Button btnAlterarSenha = view.findViewById(R.id.btnAlterarSenha);
        btnAlterarSenha.setOnClickListener(v ->
                startActivity(new Intent(requireActivity(), AlterarSenhaActivity.class)));

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