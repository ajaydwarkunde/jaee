package com.jaee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class JaeeApplication {
    public static void main(String[] args) {
        SpringApplication.run(JaeeApplication.class, args);
    }
}
