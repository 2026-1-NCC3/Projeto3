package com.example.alinhamais.api;

import android.content.Context;
import android.content.SharedPreferences;

import okhttp3.OkHttpClient;
import okhttp3.Request;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {

    private static Retrofit retrofit;
    private static ApiService apiService;

    private static final String BASE_URL =
            "https://projeto-interdisciplinar-3.onrender.com/";

    public static ApiService getApiService(Context context) {

        if (apiService == null) {

            SharedPreferences prefs = context.getSharedPreferences("MayaPrefs", Context.MODE_PRIVATE);
            String token = prefs.getString("token", "");

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(chain -> {
                        Request original = chain.request();

                        Request.Builder builder = original.newBuilder();

                        if (!token.isEmpty()) {
                            builder.addHeader("Authorization", "Bearer " + token);
                        }

                        Request request = builder.build();
                        return chain.proceed(request);
                    })

                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();

            apiService = retrofit.create(ApiService.class);
        }

        return apiService;
    }
}