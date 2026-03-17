package com.example.alinhamais;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.alinhamais.api.RetrofitClient;
import com.example.alinhamais.models.LoginRequest;
import com.example.alinhamais.models.LoginResponse;
import com.example.alinhamais.models.MeResponse;

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

        loginEdit       = findViewById(R.id.loginEdit);
        senhaEdit       = findViewById(R.id.senhaEdit);
        loginButton     = findViewById(R.id.loginButton);
        cadastrarButton = findViewById(R.id.cadastrarButton);

        loginButton.setOnClickListener(v -> fazerLogin());

        cadastrarButton.setOnClickListener(v ->
                startActivity(new Intent(LoginActivity.this, CadastroActivity.class)));
    }

    private void fazerLogin() {
        String email = loginEdit.getText().toString().trim();
        String senha = senhaEdit.getText().toString().trim();

        if (email.isEmpty() || senha.isEmpty()) {
            Toast.makeText(this, "Preencha email e senha!", Toast.LENGTH_SHORT).show();
            return;
        }

        loginButton.setEnabled(false);

        RetrofitClient.getApiService().login(new LoginRequest(email, senha))
                .enqueue(new Callback<LoginResponse>() {

                    @Override
                    public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                        loginButton.setEnabled(true);

                        if (response.isSuccessful() && response.body() != null) {
                            salvarDadosEIrParaMain(response.body());
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

    private void salvarDadosEIrParaMain(LoginResponse body) {
        String token = body.getToken();

        // Busca dados completos (telefone, data nascimento) via /auth/me
        RetrofitClient.getApiService()
                .getMe("Bearer " + token)
                .enqueue(new Callback<MeResponse>() {

                    @Override
                    public void onResponse(Call<MeResponse> call, Response<MeResponse> response) {
                        SharedPreferences.Editor editor = getSharedPreferences("MayaPrefs", MODE_PRIVATE).edit();

                        editor.putString("token", token);
                        editor.putString("nome", body.getUsuario().getNome());
                        editor.putString("email", body.getUsuario().getEmail());
                        editor.putString("perfil", body.getUsuario().getPerfil());
                        editor.putInt("id_usuario", body.getUsuario().getId());

                        // Salva telefone e data se /me retornou OK
                        if (response.isSuccessful() && response.body() != null) {
                            MeResponse me = response.body();
                            editor.putString("telefone", me.getTelefone() != null ? me.getTelefone() : "");
                            editor.putString("data_nascimento", me.getDataNascimento() != null ? me.getDataNascimento() : "");
                        }

                        editor.apply();

                        Toast.makeText(LoginActivity.this,
                                "Bem-vindo, " + body.getUsuario().getNome() + "!",
                                Toast.LENGTH_SHORT).show();

                        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                    }

                    @Override
                    public void onFailure(Call<MeResponse> call, Throwable t) {
                        // Se /me falhar, loga com dados básicos mesmo
                        getSharedPreferences("MayaPrefs", MODE_PRIVATE).edit()
                                .putString("token", token)
                                .putString("nome", body.getUsuario().getNome())
                                .putString("email", body.getUsuario().getEmail())
                                .putString("perfil", body.getUsuario().getPerfil())
                                .putInt("id_usuario", body.getUsuario().getId())
                                .apply();

                        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                    }
                });
    }
}