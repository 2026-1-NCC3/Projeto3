package com.example.alinhamais;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.alinhamais.api.RetrofitClient;
import com.example.alinhamais.models.LoginRequest;
import com.example.alinhamais.models.LoginResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText loginEdit, senhaEdit;
    private Button loginButton, cadastrarButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        loginEdit      = findViewById(R.id.loginEdit);
        senhaEdit      = findViewById(R.id.senhaEdit);
        loginButton    = findViewById(R.id.loginButton);
        cadastrarButton = findViewById(R.id.cadastrarButton);

        loginButton.setOnClickListener(v -> fazerLogin());

        cadastrarButton.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, CadastroActivity.class));
        });
    }

    private void fazerLogin() {
        String email = loginEdit.getText().toString().trim();
        String senha = senhaEdit.getText().toString().trim();

        if (email.isEmpty() || senha.isEmpty()) {
            Toast.makeText(this, "Preencha email e senha!", Toast.LENGTH_SHORT).show();
            return;
        }

        loginButton.setEnabled(false);

        LoginRequest request = new LoginRequest(email, senha);

        RetrofitClient.getApiService().login(request).enqueue(new Callback<LoginResponse>() {

            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                loginButton.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse body = response.body();

                    // Salva token e dados do usuário localmente
                    SharedPreferences prefs = getSharedPreferences("MayaPrefs", MODE_PRIVATE);
                    prefs.edit()
                            .putString("token", body.getToken())
                            .putString("nome", body.getUsuario().getNome())
                            .putString("email", body.getUsuario().getEmail())  // ← adiciona essa linha
                            .putString("perfil", body.getUsuario().getPerfil())
                            .putInt("id_usuario", body.getUsuario().getId())
                            .apply();

                    Toast.makeText(LoginActivity.this,
                            "Bem-vindo, " + body.getUsuario().getNome() + "!",
                            Toast.LENGTH_SHORT).show();

                    // Vai para MainActivity e limpa o histórico de navegação
                    Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);

                } else {
                    Toast.makeText(LoginActivity.this,
                            "Email ou senha inválidos",
                            Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                loginButton.setEnabled(true);
                Toast.makeText(LoginActivity.this,
                        "Erro de conexão. Tente novamente.",
                        Toast.LENGTH_SHORT).show();
            }
        });
    }
}