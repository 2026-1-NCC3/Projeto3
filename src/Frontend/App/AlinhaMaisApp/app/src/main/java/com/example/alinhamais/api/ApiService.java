package com.example.alinhamais.api;

import com.example.alinhamais.models.LoginRequest;
import com.example.alinhamais.models.LoginResponse;
import com.example.alinhamais.models.CadastroRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiService {

    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("auth/registro")
    Call<LoginResponse> registro(@Body CadastroRequest request);
}