package com.example.alinhamais.api;

import com.example.alinhamais.models.LoginRequest;
import com.example.alinhamais.models.LoginResponse;
import com.example.alinhamais.models.CadastroRequest;
import com.example.alinhamais.models.AlterarSenhaRequest;
import com.example.alinhamais.models.MensagemResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.Header;
import retrofit2.http.PUT;
public interface ApiService {

    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("auth/registro")
    Call<LoginResponse> registro(@Body CadastroRequest request);

    @PUT("auth/alterar-senha")
    Call<MensagemResponse> alterarSenha(
            @Header("Authorization") String token,
            @Body AlterarSenhaRequest request
    );
}
