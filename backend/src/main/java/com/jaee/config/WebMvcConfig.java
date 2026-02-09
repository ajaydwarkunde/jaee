package com.jaee.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Handles trailing slash URLs by redirecting /path/ to /path.
 * Spring Boot 3 no longer matches trailing slashes by default.
 */
@Configuration
public class WebMvcConfig {

    @Bean
    public OncePerRequestFilter trailingSlashRedirectFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain)
                    throws ServletException, IOException {
                String path = request.getRequestURI();
                // If path has trailing slash (but is not just "/"), redirect to path without it
                if (path.length() > 1 && path.endsWith("/")) {
                    String newPath = path.substring(0, path.length() - 1);
                    String query = request.getQueryString();
                    String redirectUrl = query != null ? newPath + "?" + query : newPath;
                    response.sendRedirect(redirectUrl);
                    return;
                }
                filterChain.doFilter(request, response);
            }
        };
    }
}
