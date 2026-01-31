package com.jaee.config;

import okhttp3.OkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class SupabaseConfig {

    @Value("${app.supabase.url:}")
    private String supabaseUrl;

    @Value("${app.supabase.key:}")
    private String supabaseKey;

    @Value("${app.supabase.storage-bucket:images}")
    private String storageBucket;

    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    public String getSupabaseUrl() {
        return supabaseUrl;
    }

    public String getSupabaseKey() {
        return supabaseKey;
    }

    public String getStorageBucket() {
        return storageBucket;
    }

    public boolean isConfigured() {
        return supabaseUrl != null && !supabaseUrl.isEmpty() 
                && supabaseKey != null && !supabaseKey.isEmpty();
    }
}
