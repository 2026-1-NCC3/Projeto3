package com.example.alinhamais;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;


public class FiltroDialogFragment extends DialogFragment {

    public interface OnOptionSelectedListener {
        void onOptionSelected(int selectedOptionId);
    }

    private OnOptionSelectedListener listener;

    public void setOnOptionSelectedListener(OnOptionSelectedListener listener) {
        this.listener = listener;
    }

    public static FiltroDialogFragment newInstance(int filtroAtual) {
        FiltroDialogFragment fragment = new FiltroDialogFragment();
        Bundle args = new Bundle();
        args.putInt("filtroAtual", filtroAtual);
        fragment.setArguments(args);
        return fragment;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        View view = LayoutInflater.from(getContext())
                .inflate(R.layout.dialogfragment_filtro, null);

        RadioGroup radioGroup = view.findViewById(R.id.radioGroup);
        Button btnApply = view.findViewById(R.id.btnApply);

        if (getArguments() != null) {
            int filtroAtual = getArguments().getInt("filtroAtual", -1);
            if (filtroAtual != -1) {
                radioGroup.check(filtroAtual);
            }
        }

        btnApply.setOnClickListener(v -> {
            int selectedId = radioGroup.getCheckedRadioButtonId();

            if (selectedId == -1) {
                Toast.makeText(getContext(), "Selecione uma opção", Toast.LENGTH_SHORT).show();
                return;
            }

            if (listener != null) {
                listener.onOptionSelected(selectedId);
            }

            dismiss();
        });

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(view)
                .create();

        dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);

        return dialog;
    }
}
