package com.example.alinhamais;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.FrameLayout;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import com.google.android.material.tabs.TabLayout;

public class MainActivity extends BaseActivity {

    FrameLayout frameLayout;
    TabLayout tabLayout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        SharedPreferences prefs = getSharedPreferences("MayaPrefs", MODE_PRIVATE);
        String nome = prefs.getString("nome", "Usuário");
        String perfil = prefs.getString("perfil", "");

        frameLayout = (FrameLayout) findViewById(R.id.fragmentsFrame);
        tabLayout = (TabLayout) findViewById(R.id.tabLayout);

        getSupportFragmentManager().beginTransaction().replace(R.id.fragmentsFrame, new LembretesFragment())
                .addToBackStack(null)
                .commit();

        tabLayout.setOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {

                Fragment fragment = null;
                switch (tab.getPosition()){
                    case 0:
                        fragment = new LembretesFragment();
                        break;
                    case 1:
                        fragment = new NotificacoesFragment();
                        break;
                    case 2:
                        fragment = new PerfilFragment();
                        break;
                    case 3:
                        fragment = new MoreFragment();
                        break;

                }

                getSupportFragmentManager().beginTransaction().replace(R.id.fragmentsFrame, fragment)
                        .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
                        .commit();

            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {

            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {

            }

        });

       /* ImageButton notificacaoBt = findViewById(R.id.notificacaoButton);
        notificacaoBt.setOnClickListener(v -> {
            Intent i = new Intent(MainActivity.this, NotificacaoActivity.class);
            startActivity(i);
        });

        ImageButton perfilBt = findViewById(R.id.perfilButton);
        perfilBt.setOnClickListener(v -> {
            Intent i = new Intent(MainActivity.this, PerfilActivity.class);
            startActivity(i);
        });*/



        /*TextView tv = findViewById(R.id.textView);
        tv.setText("Bem-vindo, " + nome + "! (" + perfil + ")");

        Button logoutButton = findViewById(R.id.logoutButton);
        logoutButton.setOnClickListener(v -> {
            // Limpa todos os dados salvos
            prefs.edit().clear().apply();

            // Volta para o login sem possibilidade de voltar
            Intent intent = new Intent(MainActivity.this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });*/
    }

}