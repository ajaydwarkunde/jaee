package com.jaee.config;

import com.jaee.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class CatalogCacheWarmup {

    private final ProductService productService;

    @Value("${app.cache-warm.enabled:true}")
    private boolean enabled;

    @Value("${app.cache-warm.delay-seconds:2}")
    private int delaySeconds;

    @EventListener(ApplicationReadyEvent.class)
    public void warmCatalogCache() {
        if (!enabled) {
            log.info("Catalog cache warmup is disabled.");
            return;
        }

        CompletableFuture.runAsync(() -> {
            try {
                log.info("Starting catalog cache warmup...");
                // Warm the most frequently hit storefront endpoints with tiny payloads.
                productService.getFeaturedProducts(8);
                productService.getProducts(null, null, null, null, null, null, "newest", "desc", 0, 12);
                log.info("Catalog cache warmup completed.");
            } catch (Exception ex) {
                // Warmup is best-effort and should never affect app startup.
                log.warn("Catalog cache warmup skipped due to error: {}", ex.getMessage());
            }
        }, CompletableFuture.delayedExecutor(Math.max(0, delaySeconds), TimeUnit.SECONDS));
    }
}
