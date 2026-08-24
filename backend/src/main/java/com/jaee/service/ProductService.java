package com.jaee.service;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.product.FilterOptionsDto;
import com.jaee.dto.product.ProductCreateRequest;
import com.jaee.dto.product.ProductDto;
import com.jaee.entity.Category;
import com.jaee.entity.Product;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.CategoryRepository;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.StockNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private static final List<String> DEFAULT_VARIANT_OPTION_NAMES = List.of("Default");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockNotificationService stockNotificationService;
    
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "catalog.products",
            key = "T(java.util.Objects).hash(#categoryId, #minPrice, #maxPrice, #search, #color, #size, #sortBy, #sortDir, #page, #pageSize)"
    )
    public PageResponse<ProductDto> getProducts(
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            String color,
            String size,
            String sortBy,
            String sortDir,
            int page,
            int pageSize
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), getSortField(sortBy));
        Pageable pageable = PageRequest.of(page, pageSize, sort);

        Page<Product> productPage = productRepository.findWithFilters(
                categoryId, minPrice, maxPrice, search, color, size, pageable
        );

        return PageResponse.from(productPage, ProductDto::fromListingEntity);
    }

    /**
     * Admin catalog listing. Unlike {@link #getProducts}, this returns inactive products and is
     * not cached, so newly synced drafts and activation changes are visible immediately.
     */
    @Transactional(readOnly = true)
    public PageResponse<ProductDto> getProductsForAdmin(
            String search,
            String sortBy,
            String sortDir,
            int page,
            int pageSize
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), getSortField(sortBy));
        Pageable pageable = PageRequest.of(page, pageSize, sort);

        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        Page<Product> productPage = productRepository.findAllForAdmin(normalizedSearch, pageable);

        return PageResponse.from(productPage, ProductDto::fromListingEntity);
    }

    @Transactional(readOnly = true)
    public FilterOptionsDto getFilterOptions() {
        return FilterOptionsDto.builder()
                .colors(productRepository.findDistinctColors())
                .sizes(productRepository.findDistinctSizes())
                .build();
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "catalog.product-by-slug", key = "#slug")
    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlugWithDetails(slug)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return ProductDto.fromStorefrontEntity(product);
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return ProductDto.fromEntity(product);
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "catalog.featured", key = "#limit")
    public List<ProductDto> getFeaturedProducts(int limit) {
        return productRepository.findFeaturedProducts(PageRequest.of(0, limit))
                .stream()
                .map(ProductDto::fromListingEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "catalog.on-sale", key = "T(java.util.Objects).hash(#page, #size)")
    public PageResponse<ProductDto> getOnSaleProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage = productRepository.findOnSaleProducts(pageable);
        return PageResponse.from(productPage, ProductDto::fromListingEntity);
    }
    
    @Transactional(readOnly = true)
    public List<ProductDto> getRelatedProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        
        Set<Long> categoryIds = product.getCategories().stream()
                .map(Category::getId)
                .collect(Collectors.toSet());
        
        if (categoryIds.isEmpty()) {
            return List.of();
        }
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> related = productRepository.findRelatedProducts(
                categoryIds, 
                productId, 
                pageable
        );
        
        return related.stream()
                .map(ProductDto::fromListingEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(cacheNames = {"catalog.products", "catalog.featured", "catalog.on-sale", "catalog.product-by-slug"}, allEntries = true)
    public ProductDto createProduct(ProductCreateRequest request) {
        BigDecimal sellingPrice = resolveSellingPrice(request);

        String slug = toSlug(request.getName());
        
        // Ensure unique slug
        String baseSlug = slug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Set<Category> categories = resolveCategories(request.getCategoryIds());

        Product product = Product.builder()
                .name(request.getName())
                .slug(slug)
                .description(trimDescription(request.getDescription()))
                .price(sellingPrice)
                .baseCost(request.getBaseCost())
                .weightKg(request.getWeightKg() != null ? request.getWeightKg() : new BigDecimal("0.5"))
                .compareAtPrice(request.getCompareAtPrice())
                .currency(request.getCurrency())
                .categories(categories)
                .images(request.getImages() != null ? request.getImages() : List.of())
                .videos(request.getVideos() != null ? request.getVideos() : List.of())
                .options(resolveDefaultOptions(request.getOptions()))
                .stockQty(request.getStockQty())
                .active(request.getActive())
                .customizationEnabled(Boolean.TRUE.equals(request.getCustomizationEnabled()))
                .build();

        productRepository.save(product);
        log.info("Product created: {}", product.getName());
        
        return ProductDto.fromEntity(product);
    }

    @Transactional
    @CacheEvict(cacheNames = {"catalog.products", "catalog.featured", "catalog.on-sale", "catalog.product-by-slug"}, allEntries = true)
    public ProductDto updateProduct(Long id, ProductCreateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        String newSlug = toSlug(request.getName());
        if (!newSlug.equals(product.getSlug())) {
            String baseSlug = newSlug;
            int counter = 1;
            while (productRepository.existsBySlug(newSlug)) {
                newSlug = baseSlug + "-" + counter++;
            }
            product.setSlug(newSlug);
        }

        product.getCategories().clear();
        product.getCategories().addAll(resolveCategories(request.getCategoryIds()));

        product.setName(request.getName());
        product.setDescription(trimDescription(request.getDescription()));

        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getBaseCost() != null && request.getBaseCost().compareTo(BigDecimal.ZERO) > 0) {
            product.setBaseCost(request.getBaseCost());
        }

        product.setWeightKg(request.getWeightKg() != null ? request.getWeightKg() : product.getWeightKg());
        product.setCompareAtPrice(request.getCompareAtPrice());
        product.setCurrency(request.getCurrency());
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        if (request.getVideos() != null) {
            product.setVideos(request.getVideos());
        }
        if (request.getOptions() != null) {
            product.setOptions(resolveDefaultOptions(request.getOptions()));
        }
        boolean wasOutOfStock = product.getStockQty() <= 0;
        product.setStockQty(request.getStockQty());
        product.setActive(request.getActive());
        if (request.getCustomizationEnabled() != null) {
            product.setCustomizationEnabled(request.getCustomizationEnabled());
        }

        productRepository.save(product);
        log.info("Product updated: {}", product.getName());

        if (wasOutOfStock && request.getStockQty() > 0) {
            stockNotificationService.notifySubscribers(product.getId());
        }
        
        return ProductDto.fromEntity(product);
    }

    @Transactional
    @CacheEvict(cacheNames = {"catalog.products", "catalog.featured", "catalog.on-sale", "catalog.product-by-slug"}, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        
        productRepository.delete(product);
        log.info("Product deleted: {}", product.getName());
    }

    private BigDecimal resolveSellingPrice(ProductCreateRequest request) {
        if (request.getPrice() != null && request.getPrice().compareTo(BigDecimal.ZERO) > 0) {
            return request.getPrice();
        }
        throw new BadRequestException("Provide a selling price greater than 0");
    }

    private static String trimDescription(String description) {
        if (description == null) {
            return null;
        }
        return description.trim();
    }

    /** Size + Scent unless the admin supplies a non-empty option list. */
    private List<String> resolveDefaultOptions(List<String> options) {
        if (options == null || options.isEmpty()) {
            return new ArrayList<>(DEFAULT_VARIANT_OPTION_NAMES);
        }
        return new ArrayList<>(options);
    }

    private Set<Category> resolveCategories(List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Category> found = categoryRepository.findAllById(categoryIds);
        if (found.size() != categoryIds.size()) {
            throw new BadRequestException("One or more categories not found");
        }
        return new HashSet<>(found);
    }

    private String getSortField(String sortBy) {
        return switch (sortBy) {
            case "price" -> "price";
            case "name" -> "name";
            case "newest" -> "createdAt";
            default -> "createdAt";
        };
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
