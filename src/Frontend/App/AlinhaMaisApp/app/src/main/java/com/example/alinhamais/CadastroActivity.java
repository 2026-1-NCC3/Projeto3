package com.example.alinhamais;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.alinhamais.api.RetrofitClient;
import com.example.alinhamais.models.CadastroRequest;
import com.example.alinhamais.models.LoginResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CadastroActivity extends AppCompatActivity {

    private EditText nomeEdit, emailEdit, senhaEdit, repitaSenhaEdit;
    private Button cadastrarButton, voltarButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cadastro);

        nomeEdit       = findViewById(R.id.nomeEdit);
        emailEdit      = findViewById(R.id.emailEdit);
        senhaEdit      = findViewById(R.id.senhaEdit);
        repitaSenhaEdit = findViewById(R.id.repitaSenhaEdit);
        cadastrarButton = findViewById(R.id.cadastrarButton);
        voltarButton   = findViewById(R.id.voltarButton);

        cadastrarButton.setOnClickListener(v -> fazerCadastro());

        voltarButton.setOnClickListener(v -> {
            startActivity(new Intent(CadastroActivity.this, LoginActivity.class));
        });
    }

    private void fazerCadastro() {
        String nome   = nomeEdit.getText().toString().trim();
        String email  = emailEdit.getText().toString().trim();
        String senha  = senhaEdit.getText().toString().trim();
        String repita = repitaSenhaEdit.getText().toString().trim();

        // Validações
        if (nome.isEmpty() || email.isEmpty() || senha.isEmpty()) {
            Toast.makeText(this, "Preencha todos os campos!", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!senha.equals(repita)) {
            Toast.makeText(this, "As senhas não coincidem!", Toast.LENGTH_SHORT).show();
            return;
        }

        cadastrarButton.setEnabled(false);

        CadastroRequest request = new CadastroRequest(nome, email, senha);

        RetrofitClient.getApiService().registro(request).enqueue(new Callback<LoginResponse>() {

            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                cadastrarButton.setEnabled(true);

                if (response.isSuccessful()) {
                    Toast.makeText(CadastroActivity.this,
                            "Cadastro realizado! Faça login.",
                            Toast.LENGTH_SHORT).show();

                    // Volta para o login após cadastro
                    startActivity(new Intent(CadastroActivity.this, LoginActivity.class));
                    finish();

                } else if (response.code() == 409) {
                    Toast.makeText(CadastroActivity.this,
                            "Email já cadastrado!",
                            Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(CadastroActivity.this,
                            "Erro ao cadastrar. Tente novamente.",
                            Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                cadastrarButton.setEnabled(true);
                Toast.makeText(CadastroActivity.this,
                        "Erro de conexão. Tente novamente.",
                        Toast.LENGTH_SHORT).show();
            }
        });
    }
}