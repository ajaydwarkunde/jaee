package com.jaee.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

/** Clears storefront product caches after catalog mutations. */
@Service
public class CatalogCacheService {

    @CacheEvict(
            cacheNames = {"catalog.products", "catalog.featured", "catalog.on-sale", "catalog.product-by-slug"},
            allEntries = true)
    public void evictAll() {
        // Annotation-driven eviction
    }
}
