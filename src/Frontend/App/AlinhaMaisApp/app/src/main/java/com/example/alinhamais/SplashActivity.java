package com.example.alinhamais;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    public static int TIMER_SPLASH = 3000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        new Handler().postDelayed(() -> {
            SharedPreferences prefs = getSharedPreferences("MayaPrefs", MODE_PRIVATE);
            String token = prefs.getString("token", null);

            Intent intent;
            if (token != null) {
                // Já tem token salvo → vai direto para o Main
                intent = new Intent(SplashActivity.this, MainActivity.class);
            } else {
                // Sem token → vai para o Login
                intent = new Intent(SplashActivity.this, LoginActivity.class);
            }

            startActivity(intent);
            finish();

        }, TIMER_SPLASH);
    }
}