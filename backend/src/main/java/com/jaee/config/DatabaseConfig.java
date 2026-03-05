package com.jaee.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.flyway.FlywayConfigurationCustomizer;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Slf4j
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${DATABASE_USERNAME:}")
    private String databaseUsername;

    @Value("${DATABASE_PASSWORD:}")
    private String databasePassword;

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        HikariDataSource dataSource = new HikariDataSource();
        configureDataSource(dataSource, properties);

        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);
        dataSource.setConnectionTimeout(30000);
        dataSource.setIdleTimeout(300000);
        dataSource.setMaxLifetime(600000);

        return dataSource;
    }

    /**
     * Explicitly configure Flyway's DataSource to avoid any bean-resolution
     * issues between the primary HikariCP pool and Flyway's migration runner.
     */
    @Bean
    public FlywayConfigurationCustomizer flywayConfigurationCustomizer() {
        return (FluentConfiguration configuration) -> {
            ResolvedDbConfig cfg = resolveConfig();
            if (cfg != null) {
                configuration.dataSource(cfg.url, cfg.username, cfg.password);
                log.info("Flyway DataSource configured: url={}, user={}", cfg.url, cfg.username);
            }
        };
    }

    private void configureDataSource(HikariDataSource dataSource, DataSourceProperties properties) {
        ResolvedDbConfig cfg = resolveConfig();
        if (cfg != null) {
            dataSource.setJdbcUrl(cfg.url);
            dataSource.setUsername(cfg.username);
            dataSource.setPassword(cfg.password);
            log.info("HikariCP configured: url={}, user={}, user.length={}", cfg.url, cfg.username, cfg.username.length());
        } else {
            dataSource.setJdbcUrl(properties.getUrl());
            dataSource.setUsername(properties.getUsername());
            dataSource.setPassword(properties.getPassword());
            log.info("HikariCP configured from application properties");
        }
    }

    private ResolvedDbConfig resolveConfig() {
        String url = sanitize(databaseUrl);
        String username = sanitize(databaseUsername);
        String password = sanitize(databasePassword);

        if (url == null || url.isEmpty()) return null;

        if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
            return resolveFromNativeUrl(url);
        } else if (url.startsWith("jdbc:")) {
            return resolveFromJdbcUrl(url, username, password);
        }

        return null;
    }

    private ResolvedDbConfig resolveFromNativeUrl(String url) {
        try {
            URI dbUri = new URI(url
                    .replace("postgres://", "https://")
                    .replace("postgresql://", "https://"));

            String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost()
                    + (dbUri.getPort() > 0 ? ":" + dbUri.getPort() : "")
                    + dbUri.getPath();

            jdbcUrl += dbUri.getQuery() != null ? "?" + dbUri.getQuery() : "?sslmode=require";

            String[] userInfo = dbUri.getUserInfo() != null ? dbUri.getUserInfo().split(":", 2) : null;
            String username = userInfo != null && userInfo.length > 0 ? userInfo[0] : "";
            String password = userInfo != null && userInfo.length > 1 ? userInfo[1] : "";

            return new ResolvedDbConfig(jdbcUrl, username, password);
        } catch (URISyntaxException e) {
            log.error("Failed to parse DATABASE_URL", e);
            return null;
        }
    }

    private ResolvedDbConfig resolveFromJdbcUrl(String url, String username, String password) {
        String cleanUrl = stripEmbeddedCredentials(url);

        if (username == null || username.isEmpty()) {
            username = extractQueryParam(url, "user");
        }
        if (password == null || password.isEmpty()) {
            password = extractQueryParam(url, "password");
        }
        if (username == null) username = "";
        if (password == null) password = "";

        return new ResolvedDbConfig(cleanUrl, username, password);
    }

    /**
     * Strip surrounding quotes, whitespace, and invisible characters
     * that PaaS dashboards sometimes include when copy-pasting values.
     */
    private String sanitize(String raw) {
        if (raw == null) return null;
        String trimmed = raw.strip();
        if (trimmed.isEmpty()) return trimmed;
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).strip();
        }
        return trimmed;
    }

    private String stripEmbeddedCredentials(String jdbcUrl) {
        int qIdx = jdbcUrl.indexOf('?');
        if (qIdx < 0) return jdbcUrl;

        String base = jdbcUrl.substring(0, qIdx);
        String query = jdbcUrl.substring(qIdx + 1);
        StringBuilder cleaned = new StringBuilder();
        for (String param : query.split("&")) {
            String lower = param.toLowerCase();
            if (lower.startsWith("user=") || lower.startsWith("password=")) continue;
            if (cleaned.length() > 0) cleaned.append("&");
            cleaned.append(param);
        }
        return cleaned.length() > 0 ? base + "?" + cleaned : base;
    }

    private String extractQueryParam(String url, String paramName) {
        int qIdx = url.indexOf('?');
        if (qIdx < 0) return null;
        String query = url.substring(qIdx + 1);
        for (String param : query.split("&")) {
            if (param.toLowerCase().startsWith(paramName.toLowerCase() + "=")) {
                return param.substring(paramName.length() + 1);
            }
        }
        return null;
    }

    private record ResolvedDbConfig(String url, String username, String password) {}
}
