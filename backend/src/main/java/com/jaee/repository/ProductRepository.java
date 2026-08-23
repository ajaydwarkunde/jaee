package com.jaee.repository;

import com.jaee.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySheetSkuIgnoreCase(String sheetSku);

    List<Product> findAllByNameIgnoreCase(String name);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.categories LEFT JOIN FETCH p.variants WHERE p.slug = :slug")
    Optional<Product> findBySlugWithDetails(@Param("slug") String slug);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.categories LEFT JOIN FETCH p.variants WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);
    
    boolean existsBySlug(String slug);
    
    @Query("SELECT p FROM Product p WHERE p.active = true")
    Page<Product> findAllActive(Pageable pageable);

    // Admin catalog management must also surface inactive drafts, including the ones the
    // Google Sheet sync creates, so they can be reviewed and published.
    @Query("SELECT DISTINCT p FROM Product p WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(COALESCE(p.name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(p.sheetSku, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "EXISTS (SELECT 1 FROM ProductVariant v WHERE v.product = p " +
           "AND LOWER(COALESCE(v.sku, '')) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Product> findAllForAdmin(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT DISTINCT p FROM Product p JOIN p.categories c WHERE p.active = true AND c.id = :categoryId")
    Page<Product> findAllActiveByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT p.id) FROM Product p JOIN p.categories c WHERE c.id = :categoryId AND p.active = true")
    long countActiveProductsForCategory(@Param("categoryId") Long categoryId);
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProducts(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN p.categories c " +
           "WHERE p.active = true AND " +
           "(:categoryId IS NULL OR c.id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:color IS NULL OR :color = '' OR EXISTS (" +
           "  SELECT 1 FROM ProductVariant pv JOIN pv.optionValues pov " +
           "  WHERE pv.product = p AND KEY(pov) = 'Color' AND LOWER(pov) = LOWER(:color))) AND " +
           "(:size IS NULL OR :size = '' OR EXISTS (" +
           "  SELECT 1 FROM ProductVariant pv2 JOIN pv2.optionValues pov2 " +
           "  WHERE pv2.product = p AND KEY(pov2) = 'Size' AND LOWER(pov2) = LOWER(:size))) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(COALESCE(p.name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(c.name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "EXISTS (SELECT 1 FROM ProductVariant sv JOIN sv.optionValues sov " +
           "  WHERE sv.product = p AND LOWER(sov) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "EXISTS (SELECT 1 FROM ProductVariant skv " +
           "  WHERE skv.product = p AND LOWER(COALESCE(skv.sku, '')) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Product> findWithFilters(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        @Param("color") String color,
        @Param("size") String size,
        Pageable pageable
    );
    
    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.createdAt DESC")
    List<Product> findFeaturedProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.compareAtPrice IS NOT NULL AND p.compareAtPrice > p.price")
    Page<Product> findOnSaleProducts(Pageable pageable);
    
    // DISTINCT + ORDER BY RANDOM() is invalid in PostgreSQL; de-dupe ids in a subquery, then shuffle outer rows.
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.id IN " +
           "(SELECT DISTINCT p2.id FROM Product p2 JOIN p2.categories c " +
           "WHERE p2.active = true AND c.id IN :categoryIds AND p2.id <> :productId) " +
           "ORDER BY function('random')")
    List<Product> findRelatedProducts(@Param("categoryIds") Set<Long> categoryIds, @Param("productId") Long productId, Pageable pageable);

    @Query("SELECT DISTINCT ov FROM Product p JOIN p.variants v JOIN v.optionValues ov " +
           "WHERE p.active = true AND KEY(ov) = 'Color' ORDER BY ov")
    List<String> findDistinctColors();

    @Query("SELECT DISTINCT ov FROM Product p JOIN p.variants v JOIN v.optionValues ov " +
           "WHERE p.active = true AND KEY(ov) = 'Size' ORDER BY ov")
    List<String> findDistinctSizes();
}
