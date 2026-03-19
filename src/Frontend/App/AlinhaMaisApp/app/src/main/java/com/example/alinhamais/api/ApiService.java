package com.example.alinhamais.api;

import com.example.alinhamais.models.LembreteResponse;
import com.example.alinhamais.models.LoginRequest;
import com.example.alinhamais.models.LoginResponse;
import com.example.alinhamais.models.MeResponse;
import com.example.alinhamais.models.MensagemResponse;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ApiService {

    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("auth/me")
    Call<MeResponse> getMe(@Header("Authorization") String token);

    @GET("lembretes/paciente/{id}")
    Call<List<LembreteResponse>> getLembretesPaciente(
            @Header("Authorization") String token,
            @Path("id") int idPaciente
    );

    @PATCH("lembretes/{id_lembrete}/paciente/{id_paciente}")
    Call<MensagemResponse> toggleLembrete(
            @Header("Authorization") String token,
            @Path("id_lembrete") int idLembrete,
            @Path("id_paciente") int idPaciente,
            @Body Map<String, Integer> body
    );
}