package com.example.alinhamais;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import androidx.activity.result.contract.ActivityResultContracts;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

public class MoreFragment extends Fragment {


    public MoreFragment() {
        // Required empty public constructor
    }

    public static MoreFragment newInstance() {
        MoreFragment fragment = new MoreFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View rootView = inflater.inflate(R.layout.fragment_more, container, false);

        //Botões com Imagem
        ImageButton linkedinBtn = rootView.findViewById(R.id.linkedinImgBtn);
        ImageButton instagramBtn = rootView.findViewById(R.id.instagramImgBtn);
        ImageButton youtubeBtn = rootView.findViewById(R.id.youtubeImgBtn);
        ImageButton siteBtn = rootView.findViewById(R.id.siteImgBtn);
        Button contatosBtn = rootView.findViewById(R.id.contatosBtn);

        //Manda para os links quando os botões são clicados
        linkedinBtn.setOnClickListener(v -> goToLink("https://www.linkedin.com/in/maya-yoshiko-yamamoto-bb18a736?originalSubdomain=br"));

        youtubeBtn.setOnClickListener(v -> goToLink("https://www.youtube.com/@rpg.mayayamamoto"));

        instagramBtn.setOnClickListener(v -> goToLink("https://www.instagram.com/rpg.maya/"));

        siteBtn.setOnClickListener(v -> goToLink("https://mayayamamoto.com.br/"));

        contatosBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ContatosFragment nextFrag = new ContatosFragment();

                getParentFragmentManager().beginTransaction()
                        .replace(R.id.fragmentsFrame, nextFrag)
                        .addToBackStack(null)
                        .commit();
            }
        });

        return (rootView);

    }


    //Pega uma string(link) e manda para esse link
    private void goToLink(String url){
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }
}