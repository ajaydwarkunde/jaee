package com.jaee.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Logs all incoming HTTP requests for monitoring and debugging.
 * Visible in Render logs.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        
        long startTime = System.currentTimeMillis();
        
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        // Log the incoming request
        log.info("→ {} {} {} [IP: {}]", 
                method, 
                uri + (queryString != null ? "?" + queryString : ""),
                userAgent != null ? userAgent.substring(0, Math.min(50, userAgent.length())) : "-",
                clientIp);
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            
            // Log the response with status and duration
            String statusEmoji = status >= 500 ? "❌" : status >= 400 ? "⚠️" : "✓";
            log.info("← {} {} {} {}ms", statusEmoji, status, uri, duration);
        }
    }
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip logging for health checks to reduce noise
        return path.contains("/actuator/health");
    }
}
