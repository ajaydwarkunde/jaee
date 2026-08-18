package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight public ping for UptimeRobot (HEAD/GET) that also touches the database
 * so Render free-tier + Postgres stay warm.
 */
@RestController
@RequestMapping("/keepalive")
@RequiredArgsConstructor
public class KeepAliveController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> keepAlive() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            boolean up = Integer.valueOf(1).equals(result);
            if (!up) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(ApiResponse.error("Database ping failed"));
            }
            return ResponseEntity.ok(ApiResponse.success(Map.of("status", "UP", "db", "UP")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("Database ping failed"));
        }
    }
}
