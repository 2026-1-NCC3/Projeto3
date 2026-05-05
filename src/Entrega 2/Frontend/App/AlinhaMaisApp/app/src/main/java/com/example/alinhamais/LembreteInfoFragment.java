package com.example.alinhamais;

import android.content.res.ColorStateList;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.core.content.ContextCompat;
import androidx.core.widget.ImageViewCompat;
import androidx.fragment.app.Fragment;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.ViewModelProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.bumptech.glide.Glide;
import com.example.alinhamais.models.LembreteResponse;
import com.example.alinhamais.models.StreakViewModel;

public class LembreteInfoFragment extends Fragment {


    private int lembreteId, dayOfWeek;
    private CheckBox checkBox;
    private TextView tvDescricao, tvTitulo, streakNum, streakTxt;
    private StreakViewModel viewModel;
    private static final String baseUrl = "https://projeto-interdisciplinar-3.onrender.com";

    private ImageView imgLembrete, fogo, imgSeg, imgTer, imgQua, imgQui, imgSex, imgSab, imgDom;
    ImageButton btnVoltar;


    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_lembrete_info, container, false);

    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        imgSeg = view.findViewById(R.id.tv_dia_seg);
        imgTer = view.findViewById(R.id.tv_dia_ter);
        imgQua = view.findViewById(R.id.tv_dia_qua);
        imgQui = view.findViewById(R.id.tv_dia_qui);
        imgSex = view.findViewById(R.id.tv_dia_sex);
        imgSab = view.findViewById(R.id.tv_dia_sab);
        imgDom = view.findViewById(R.id.tv_dia_dom);

        btnVoltar = view.findViewById(R.id.btnVoltar);

        //Infos
        tvDescricao = view.findViewById(R.id.tvDescricaoLembrete);
        tvTitulo = view.findViewById(R.id.tvTituloLembrete);
        imgLembrete = view.findViewById(R.id.imgLembrete);

        LembreteResponse lembrete = (LembreteResponse) getArguments().getSerializable("lembrete");

        tvTitulo.setText(lembrete.getTitulo());

        if (lembrete.getDescricao() != null && !lembrete.getDescricao().isEmpty()) {
            tvDescricao.setText(lembrete.getDescricao());
            tvDescricao.setVisibility(View.VISIBLE);
        } else {
            tvDescricao.setVisibility(View.GONE);
        }

        // Foto
        if (lembrete.getFoto() != null && !lembrete.getFoto().isEmpty()) {
            Glide.with(requireContext())
                    .load(baseUrl + lembrete.getFoto())
                    .centerCrop()
                    .placeholder(R.drawable.usuario_placeholder)
                    .into(imgLembrete);
        } else {
            imgLembrete.setImageResource(R.drawable.sem_notificacao);
        }

        //atualiza quando rola pra cima
        SwipeRefreshLayout swipeRefresh = view.findViewById(R.id.swipeRefresh);

        swipeRefresh.setOnRefreshListener(() -> {

            boolean isLocked = viewModel.isLockedToday(lembreteId);

            checkBox.setChecked(isLocked);
            checkBox.setEnabled(!isLocked);
            updateImage(isLocked);
            if (viewModel.isLockedToday(lembreteId)) {
                diaSemana();
            }

            swipeRefresh.setRefreshing(false);
        });


        //Streak
        fogo = view.findViewById(R.id.fogo);
        streakNum = view.findViewById(R.id.streakNum);
        lembreteId = lembrete.getIdLembrete();
        checkBox = view.findViewById(R.id.checkbox);
        streakTxt = view.findViewById(R.id.streakTxt);

        viewModel = new ViewModelProvider(requireActivity()).get(StreakViewModel.class);
        viewModel.init(requireContext());

        dayOfWeek = viewModel.getDayOfWeek();
        //mostra o current streak semanal nas bolinhas
        diaSemana();

        checkBox.setChecked(viewModel.isLockedToday(lembreteId));
        checkBox.setEnabled(!viewModel.isLockedToday(lembreteId));

            viewModel = new ViewModelProvider(requireActivity()).get(StreakViewModel.class);
            viewModel.init(requireContext()); // carrega as prefs
            viewModel.checkStreakReset(lembreteId); //checa se 'e pro streak resetar

            // Volta o estado da caixa
            checkBox.setChecked(viewModel.isLockedToday(lembreteId));
            checkBox.setEnabled(!viewModel.isLockedToday(lembreteId));

            // Observa o contador da streak e muda o texto do numero
            viewModel.getCounter(lembreteId).observe(getViewLifecycleOwner(), count -> {
                streakNum.setText(String.valueOf(count));
                updateImage(viewModel.isLockedToday(lembreteId));
            });

        updateImage(viewModel.isLockedToday(lembreteId));

        //checa se o estado da caixa mudou, aumenta o streak, chama o updateImage e tranca a caixa
            checkBox.setOnCheckedChangeListener((btn, isChecked) -> {
                if (isChecked) {
                    viewModel.increment(lembreteId);
                    checkBox.setEnabled(false);
                    viewModel.setDayCompleted(lembreteId, dayOfWeek);
                    updateImage(true);

                }
            });


            //botao de voltar
        btnVoltar.setOnClickListener(v -> {
            Fragment destination = new LembretesFragment();
            getParentFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragmentsFrame, destination)
                    .addToBackStack(null)
                    .commit();
        });


    }


    //faz o update das bolinhas do streak, imagem de foguinho, e frase
    private void updateImage(boolean isChecked) {
        if (isChecked) {
            fogo.setImageResource(R.drawable.fogo);
            streakTxt.setText("Parabens! Você já completou este exercicio hoje!");
            diaSemana();
        } else {
            if(dayOfWeek == 1){
                viewModel.resetWeek(lembreteId);
                imgSeg.setImageResource(R.drawable.circulo);
                imgTer.setImageResource(R.drawable.circulo);
                imgQua.setImageResource(R.drawable.circulo);
                imgQui.setImageResource(R.drawable.circulo);
                imgSex.setImageResource(R.drawable.circulo);
                imgSab.setImageResource(R.drawable.circulo);
                imgDom.setImageResource(R.drawable.circulo);
            }
            fogo.setImageResource(R.drawable.fogo_vazio);
            streakTxt.setText("Complete o exercicio e continue com sua sequência!");
        }
    }

    //muda as bolinhas do streak
    private void diaSemana() {
        imgSeg.setImageResource(viewModel.isDayCompleted(lembreteId, 2) ? R.drawable.circulo_completo : R.drawable.circulo);
        imgTer.setImageResource(viewModel.isDayCompleted(lembreteId, 3) ? R.drawable.circulo_completo : R.drawable.circulo);
        imgQua.setImageResource(viewModel.isDayCompleted(lembreteId, 4) ? R.drawable.circulo_completo : R.drawable.circulo);
        imgQui.setImageResource(viewModel.isDayCompleted(lembreteId, 5) ? R.drawable.circulo_completo : R.drawable.circulo);
        imgSex.setImageResource(viewModel.isDayCompleted(lembreteId, 6) ? R.drawable.circulo_completo : R.drawable.circulo);
        imgSab.setImageResource(viewModel.isDayCompleted(lembreteId, 7) ? R.drawable.circulo_completo : R.drawable.circulo);
        imgDom.setImageResource(viewModel.isDayCompleted(lembreteId, 1) ? R.drawable.circulo_completo : R.drawable.circulo);
    }




}


