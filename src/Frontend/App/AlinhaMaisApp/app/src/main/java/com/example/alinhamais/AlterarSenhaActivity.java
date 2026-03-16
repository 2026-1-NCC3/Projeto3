package com.example.alinhamais;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.example.alinhamais.api.RetrofitClient;
import com.example.alinhamais.models.AlterarSenhaRequest;
import com.example.alinhamais.models.MensagemResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AlterarSenhaActivity extends BaseActivity {

    private EditText etSenhaAtual, etNovaSenha, etRepitaNovaSenha;
    private Button btnConfirmar, btnVoltar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_alterar_senha);

        etSenhaAtual      = findViewById(R.id.etSenhaAtual);
        etNovaSenha       = findViewById(R.id.etNovaSenha);
        etRepitaNovaSenha = findViewById(R.id.etRepitaNovaSenha);
        btnConfirmar      = findViewById(R.id.btnConfirmarSenha);
        btnVoltar         = findViewById(R.id.btnVoltarSenha);

        btnVoltar.setOnClickListener(v -> finish());

        btnConfirmar.setOnClickListener(v -> alterarSenha());
    }

    private void alterarSenha() {
        String senhaAtual      = etSenhaAtual.getText().toString().trim();
        String novaSenha       = etNovaSenha.getText().toString().trim();
        String repitaNovaSenha = etRepitaNovaSenha.getText().toString().trim();

        if (senhaAtual.isEmpty() || novaSenha.isEmpty() || repitaNovaSenha.isEmpty()) {
            Toast.makeText(this, "Preencha todos os campos!", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!novaSenha.equals(repitaNovaSenha)) {
            Toast.makeText(this, "As senhas não coincidem!", Toast.LENGTH_SHORT).show();
            return;
        }

        if (novaSenha.length() < 6) {
            Toast.makeText(this, "A senha deve ter pelo menos 6 caracteres!", Toast.LENGTH_SHORT).show();
            return;
        }

        btnConfirmar.setEnabled(false);

        SharedPreferences prefs = getSharedPreferences("MayaPrefs", MODE_PRIVATE);
        String token = "Bearer " + prefs.getString("token", "");

        AlterarSenhaRequest request = new AlterarSenhaRequest(senhaAtual, novaSenha);

        RetrofitClient.getApiService().alterarSenha(token, request).enqueue(new Callback<MensagemResponse>() {
            @Override
            public void onResponse(Call<MensagemResponse> call, Response<MensagemResponse> response) {
                btnConfirmar.setEnabled(true);

                if (response.isSuccessful()) {
                    // Vai para tela de sucesso e limpa o histórico
                    Intent intent = new Intent(AlterarSenhaActivity.this, SucessoActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(intent);
                    finish();
                } else if (response.code() == 401) {
                    Toast.makeText(AlterarSenhaActivity.this,
                            "Senha atual incorreta!",
                            Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(AlterarSenhaActivity.this,
                            "Erro ao alterar senha. Tente novamente.",
                            Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<MensagemResponse> call, Throwable t) {
                btnConfirmar.setEnabled(true);
                Toast.makeText(AlterarSenhaActivity.this,
                        "Erro de conexão. Tente novamente.",
                        Toast.LENGTH_SHORT).show();
            }
        });
    }
}