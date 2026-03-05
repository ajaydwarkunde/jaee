package com.jaee.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Handles Render's DATABASE_URL format (postgres://user:pass@host:port/db)
 * and converts it to JDBC format for Spring Boot.
 */
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

        if (databaseUrl != null && !databaseUrl.isEmpty() && databaseUrl.startsWith("postgres")) {
            try {
                URI dbUri = new URI(databaseUrl.replace("postgres://", "https://").replace("postgresql://", "https://"));
                String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost()
                        + (dbUri.getPort() > 0 ? ":" + dbUri.getPort() : "")
                        + dbUri.getPath();

                if (dbUri.getQuery() != null) {
                    jdbcUrl += "?" + dbUri.getQuery();
                } else {
                    jdbcUrl += "?sslmode=require";
                }

                String[] userInfo = dbUri.getUserInfo() != null ? dbUri.getUserInfo().split(":") : null;
                String username = userInfo != null && userInfo.length > 0 ? userInfo[0] : "";
                String password = userInfo != null && userInfo.length > 1 ? userInfo[1] : "";

                dataSource.setJdbcUrl(jdbcUrl);
                dataSource.setUsername(username);
                dataSource.setPassword(password);
                log.info("Database configured from DATABASE_URL: {}", dbUri.getHost());
            } catch (URISyntaxException e) {
                log.error("Failed to parse DATABASE_URL, falling back to properties", e);
                configureFromProperties(dataSource, properties);
            }
        } else if (databaseUrl != null && databaseUrl.startsWith("jdbc:")) {
            dataSource.setJdbcUrl(databaseUrl);
            dataSource.setUsername(databaseUsername.isEmpty() ? properties.getUsername() : databaseUsername);
            dataSource.setPassword(databasePassword.isEmpty() ? properties.getPassword() : databasePassword);
            log.info("Database configured from JDBC URL");
        } else {
            configureFromProperties(dataSource, properties);
            log.info("Database configured from application properties");
        }

        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);
        dataSource.setConnectionTimeout(30000);
        dataSource.setIdleTimeout(300000);
        dataSource.setMaxLifetime(600000);

        return dataSource;
    }

    private void configureFromProperties(HikariDataSource dataSource, DataSourceProperties properties) {
        dataSource.setJdbcUrl(properties.getUrl());
        dataSource.setUsername(properties.getUsername());
        dataSource.setPassword(properties.getPassword());
    }
}
