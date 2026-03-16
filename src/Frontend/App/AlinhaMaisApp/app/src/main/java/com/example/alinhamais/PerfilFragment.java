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

        // Pega dados do usuário logado
        SharedPreferences prefs = requireActivity()
                .getSharedPreferences("MayaPrefs", requireActivity().MODE_PRIVATE);

        String nome   = prefs.getString("nome", "Usuário");
        String email  = prefs.getString("email", "");
        String perfil = prefs.getString("perfil", "");

        // Preenche os campos
        TextView tvNome   = view.findViewById(R.id.tvNome);
        TextView tvEmail  = view.findViewById(R.id.tvEmail);
        TextView tvPerfil = view.findViewById(R.id.tvPerfil);

        tvNome.setText(nome);
        tvEmail.setText(email);
        tvPerfil.setText(perfil.equals("admin") ? "Administrador" : "Paciente");

        // Botão logout
        Button logoutButton = view.findViewById(R.id.logoutButton);
        logoutButton.setOnClickListener(v -> {
            prefs.edit().clear().apply();

            Intent intent = new Intent(requireActivity(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }
}