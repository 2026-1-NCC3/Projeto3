package com.example.alinhamais;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        SharedPreferences prefs = getSharedPreferences("MayaPrefs", MODE_PRIVATE);
        String nome   = prefs.getString("nome", "Usuário");
        String perfil = prefs.getString("perfil", "");

        TextView tv = findViewById(R.id.textView);
        tv.setText("Bem-vindo, " + nome + "! (" + perfil + ")");

        Button logoutButton = findViewById(R.id.logoutButton);
        logoutButton.setOnClickListener(v -> {
            // Limpa todos os dados salvos
            prefs.edit().clear().apply();

            // Volta para o login sem possibilidade de voltar
            Intent intent = new Intent(MainActivity.this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });
    }
}