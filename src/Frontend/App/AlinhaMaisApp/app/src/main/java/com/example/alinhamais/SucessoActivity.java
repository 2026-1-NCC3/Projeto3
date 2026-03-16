package com.example.alinhamais;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

public class SucessoActivity extends BaseActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sucesso);

        // Volta para MainActivity após 2 segundos
        new Handler().postDelayed(() -> {
            Intent intent = new Intent(SucessoActivity.this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        }, 2000);
    }
}