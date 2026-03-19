package com.example.alinhamais.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.alinhamais.R;
import com.example.alinhamais.models.LembreteResponse;
import com.google.android.material.switchmaterial.SwitchMaterial;

import java.util.List;

public class LembreteAdapter extends
        RecyclerView.Adapter<LembreteAdapter.ViewHolder> {

    public interface OnToggleListener {
        void onToggle(LembreteResponse lembrete, boolean ativo);
    }

    private final List<LembreteResponse> lista;
    private final Context context;
    private final OnToggleListener listener;
    private final String baseUrl;

    public LembreteAdapter(Context context, List<LembreteResponse> lista,
                           String baseUrl, OnToggleListener listener) {
        this.context  = context;
        this.lista    = lista;
        this.baseUrl  = baseUrl;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context)
                .inflate(R.layout.item_lembrete, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        LembreteResponse l = lista.get(position);

        holder.tvTitulo.setText(l.getTitulo());

        if (l.getDescricao() != null && !l.getDescricao().isEmpty()) {
            holder.tvDescricao.setText(l.getDescricao());
            holder.tvDescricao.setVisibility(View.VISIBLE);
        } else {
            holder.tvDescricao.setVisibility(View.GONE);
        }

        // Intervalo
        int min = l.getIntervaloMinutos();
        if (min > 0) {
            String intervalo = min < 60
                    ? "⏱ " + min + " min"
                    : "⏱ " + (min / 60) + "h" + (min % 60 > 0 ? " " + (min % 60) + "min" : "");
            holder.tvIntervalo.setText(intervalo);
        }

        // Horário
        if (l.getHorarioInicio() != null && l.getHorarioFim() != null) {
            holder.tvHorario.setText("🕐 " + l.getHorarioInicio()
                    + " — " + l.getHorarioFim());
        }

        // Foto
        if (l.getFoto() != null && !l.getFoto().isEmpty()) {
            Glide.with(context)
                    .load(baseUrl + l.getFoto())
                    .centerCrop()
                    .placeholder(R.drawable.usuario_placeholder)
                    .into(holder.imgLembrete);
        } else {
            holder.imgLembrete.setImageResource(R.drawable.sem_notificacao);
        }

        // Switch — desativa listener antes de setar o valor
        holder.switchLembrete.setOnCheckedChangeListener(null);
        holder.switchLembrete.setChecked(l.getAtivo() == 1);
        holder.tvStatus.setText(l.getAtivo() == 1
                ? "Notificações ativas"
                : "Notificações desativadas");

        holder.switchLembrete.setOnCheckedChangeListener((btn, isChecked) -> {
            l.setAtivo(isChecked ? 1 : 0);
            holder.tvStatus.setText(isChecked
                    ? "Notificações ativas"
                    : "Notificações desativadas");
            listener.onToggle(l, isChecked);
        });
    }

    @Override
    public int getItemCount() { return lista.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView imgLembrete;
        TextView tvTitulo, tvDescricao, tvIntervalo, tvHorario, tvStatus;
        SwitchMaterial switchLembrete;

        ViewHolder(View view) {
            super(view);
            imgLembrete    = view.findViewById(R.id.imgLembrete);
            tvTitulo       = view.findViewById(R.id.tvTituloLembrete);
            tvDescricao    = view.findViewById(R.id.tvDescricaoLembrete);
            tvIntervalo    = view.findViewById(R.id.tvIntervalo);
            tvHorario      = view.findViewById(R.id.tvHorario);
            tvStatus       = view.findViewById(R.id.tvStatusLembrete);
            switchLembrete = view.findViewById(R.id.switchLembrete);
        }
    }
}