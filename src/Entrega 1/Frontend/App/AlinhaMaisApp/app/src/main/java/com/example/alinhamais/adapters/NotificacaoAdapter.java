package com.example.alinhamais.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.graphics.Color;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.example.alinhamais.R;
import com.example.alinhamais.models.NotificacaoResponse;

import java.util.List;

public class NotificacaoAdapter extends RecyclerView.Adapter<NotificacaoAdapter.ViewHolder> {

    private List<NotificacaoResponse> lista;

    public List<NotificacaoResponse> getLista() {
        return lista;
    }

    private OnItemClickListener listener;

    private  Context context;

    public interface OnItemClickListener {
        void onClick(NotificacaoResponse notificacao);
    }

    public NotificacaoAdapter(Context context, List<NotificacaoResponse> lista, OnItemClickListener listener) {
        this.context = context;
        this.lista = lista;
        this.listener = listener;
    }

    public void setLista(List<NotificacaoResponse> lista) {
        this.lista = lista;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_notificacao, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        NotificacaoResponse n = lista.get(position);

        holder.titulo.setText(n.getTitulo());
        holder.mensagem.setText(n.getMensagem());
        holder.data.setText(n.getData_envio());

        // 🔥 CORES (lida vs nao_lida)
        if ("nao_lida".equals(n.getStatus())) {

            holder.cardView.setCardBackgroundColor(ContextCompat.getColor(context, R.color.primariaClaro));
            holder.titulo.setTextColor(ContextCompat.getColor(context, R.color.wb));
            holder.mensagem.setTextColor(ContextCompat.getColor(context, R.color.wb));
            holder.data.setTextColor(Color.parseColor("#E0E0E0"));

        } else {

            holder.cardView.setCardBackgroundColor(ContextCompat.getColor(context, R.color.boxBg));

            holder.titulo.setTextColor(ContextCompat.getColor(context, R.color.bw));
            holder.mensagem.setTextColor(ContextCompat.getColor(context, R.color.bw));
            holder.data.setTextColor(Color.DKGRAY);
        }

        // 🔥 CLIQUE (opcional: marcar individual como lida)
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onClick(n);
            }
        });
    }

    @Override
    public int getItemCount() {
        return lista != null ? lista.size() : 0;
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView titulo, mensagem, data;
        CardView cardView;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);

            titulo = itemView.findViewById(R.id.txtTitulo);
            mensagem = itemView.findViewById(R.id.txtMensagem);
            data = itemView.findViewById(R.id.txtData);
            cardView = itemView.findViewById(R.id.cardNotificacao);
        }
    }
}