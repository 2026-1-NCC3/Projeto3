package com.example.alinhamais.api;

import com.example.alinhamais.models.LoginRequest;
import com.example.alinhamais.models.LoginResponse;
import com.example.alinhamais.models.MeResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface ApiService {

    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @GET("auth/me")
    Call<MeResponse> getMe(@Header("Authorization") String token);
}