package com.example.alinhamais;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.Toast;


public class ContatosFragment extends Fragment {
    ImageButton btnVoltar;

    public ContatosFragment() {
        // Required empty public constructor
    }


    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View rootView = inflater.inflate(R.layout.fragment_contatos, container, false);

        btnVoltar = rootView.findViewById(R.id.btnVoltar);
        Button emailBtn = rootView.findViewById(R.id.emailBtn);
        Button whatsappBtn = rootView.findViewById(R.id.whatsappBtn);

        whatsappBtn.setOnClickListener(v -> goToLink("https://wa.me/11947294719"));

        emailBtn.setOnClickListener(v -> sendEmail());

        return(rootView);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        //botao de voltar
        btnVoltar.setOnClickListener(v -> {
            Fragment destination = new MoreFragment();
            getParentFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragmentsFrame, destination)
                    .addToBackStack(null)
                    .commit();
        });
    }

    //Pega uma string(link) e manda para esse link
    private void goToLink(String url){
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    private void sendEmail() {
        Intent intent = new Intent(Intent.ACTION_SENDTO);
        intent.setData(Uri.parse("mailto:stefanysoliveirac@gmail.com")); // Only email apps should handle this
        intent.putExtra(Intent.EXTRA_SUBJECT, "Dúvida sobre o App");
        intent.putExtra(Intent.EXTRA_TEXT, "Olá, vim pelo aplicativo Alinha+, gostaria de falar sobre...");

        try {
            startActivity(Intent.createChooser(intent, "Enviar e-mail com..."));
        } catch (android.content.ActivityNotFoundException ex) {
            // Caso não haja app de email
            Toast.makeText(getActivity(), "Não há aplicativos de e-mail instalados.", Toast.LENGTH_SHORT).show();
        }
    }
}