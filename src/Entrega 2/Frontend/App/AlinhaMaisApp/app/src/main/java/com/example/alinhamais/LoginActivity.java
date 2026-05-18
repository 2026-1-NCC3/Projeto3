package com.example.alinhamais;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
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

    private EditText cpfEdit, idLoginEdit;
    private Button loginButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        cpfEdit     = findViewById(R.id.cpfEdit);
        idLoginEdit = findViewById(R.id.idLoginEdit);
        loginButton = findViewById(R.id.loginButton);

        cpfEdit.addTextChangedListener(mascaraCPF());

        loginButton.setOnClickListener(v -> fazerLogin());
    }

    // TextWatcher que aplica a máscara 000.000.000-00 enquanto o usuário digita
    private TextWatcher mascaraCPF() {
        return new TextWatcher() {
            boolean editando = false;

            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                if (editando) return;
                editando = true;

                String digitos = s.toString().replaceAll("\\D", "");

                if (digitos.length() > 11) {
                    digitos = digitos.substring(0, 11);
                }

                StringBuilder formatado = new StringBuilder();
                for (int i = 0; i < digitos.length(); i++) {
                    if (i == 3 || i == 6) formatado.append(".");
                    if (i == 9)           formatado.append("-");
                    formatado.append(digitos.charAt(i));
                }

                cpfEdit.setText(formatado.toString());
                cpfEdit.setSelection(formatado.length());

                editando = false;
            }
        };
    }

    private void fazerLogin() {
        // Envia o CPF formatado (000.000.000-00), como está salvo no banco
        String cpf      = cpfEdit.getText().toString().trim();
        String id_login = idLoginEdit.getText().toString().trim();

        if (cpf.isEmpty() || id_login.isEmpty()) {
            Toast.makeText(this, "Preencha CPF e código de acesso!",
                    Toast.LENGTH_SHORT).show();
            return;
        }

        loginButton.setEnabled(false);

        RetrofitClient.getApiService(this)
                .login(new LoginRequest(cpf, id_login))
                .enqueue(new Callback<LoginResponse>() {

                    @Override
                    public void onResponse(Call<LoginResponse> call,
                                           Response<LoginResponse> response) {
                        loginButton.setEnabled(true);

                        if (response.isSuccessful() && response.body() != null) {
                            salvarDadosEIrParaMain(response.body());
                        } else {
                            Toast.makeText(LoginActivity.this,
                                    "CPF ou código inválidos",
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

        RetrofitClient.getApiService(this)
                .getMe("Bearer " + token)
                .enqueue(new Callback<MeResponse>() {

                    @Override
                    public void onResponse(Call<MeResponse> call,
                                           Response<MeResponse> response) {
                        SharedPreferences.Editor editor = getSharedPreferences(
                                "MayaPrefs", MODE_PRIVATE).edit();

                        editor.putString("token", token);
                        editor.putString("nome", body.getUsuario().getNome());
                        editor.putString("email", body.getUsuario().getEmail());
                        editor.putString("perfil", body.getUsuario().getPerfil());
                        editor.putInt("id_usuario", body.getUsuario().getId());

                        if (response.isSuccessful() && response.body() != null) {
                            MeResponse me = response.body();
                            editor.putString("telefone",
                                    me.getTelefone() != null ? me.getTelefone() : "");
                            editor.putString("data_nascimento",
                                    me.getDataNascimento() != null ? me.getDataNascimento() : "");
                            editor.putString("id_login",
                                    me.getIdLogin() != null ? me.getIdLogin() : "");
                        }

                        editor.apply();

                        Toast.makeText(LoginActivity.this,
                                "Bem-vindo, " + body.getUsuario().getNome() + "!",
                                Toast.LENGTH_SHORT).show();

                        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                                Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                    }

                    @Override
                    public void onFailure(Call<MeResponse> call, Throwable t) {
                        getSharedPreferences("MayaPrefs", MODE_PRIVATE).edit()
                                .putString("token", token)
                                .putString("nome", body.getUsuario().getNome())
                                .putString("email", body.getUsuario().getEmail())
                                .putString("perfil", body.getUsuario().getPerfil())
                                .putInt("id_usuario", body.getUsuario().getId())
                                .apply();

                        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                                Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                    }
                });
    }
}