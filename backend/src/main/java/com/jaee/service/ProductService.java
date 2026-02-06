package com.jaee.service;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.product.ProductCreateRequest;
import com.jaee.dto.product.ProductDto;
import com.jaee.entity.Category;
import com.jaee.entity.Product;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.CategoryRepository;
import com.jaee.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public PageResponse<ProductDto> getProducts(
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            String sortBy,
            String sortDir,
            int page,
            int size
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), getSortField(sortBy));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.findWithFilters(
                categoryId, minPrice, maxPrice, search, pageable
        );

        return PageResponse.from(productPage, ProductDto::fromEntity);
    }

    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return ProductDto.fromEntity(product);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return ProductDto.fromEntity(product);
    }

    public List<ProductDto> getFeaturedProducts(int limit) {
        return productRepository.findFeaturedProducts(PageRequest.of(0, limit))
                .stream()
                .map(ProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductCreateRequest request) {
        String slug = toSlug(request.getName());
        
        // Ensure unique slug
        String baseSlug = slug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BadRequestException("Category not found"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .compareAtPrice(request.getCompareAtPrice())
                .currency(request.getCurrency())
                .category(category)
                .images(request.getImages() != null ? request.getImages() : List.of())
                .stockQty(request.getStockQty())
                .active(request.getActive())
                .build();

        productRepository.save(product);
        log.info("Product created: {}", product.getName());
        
        return ProductDto.fromEntity(product);
    }

    @Transactional
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

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BadRequestException("Category not found"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCompareAtPrice(request.getCompareAtPrice());
        product.setCurrency(request.getCurrency());
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        product.setStockQty(request.getStockQty());
        product.setActive(request.getActive());

        productRepository.save(product);
        log.info("Product updated: {}", product.getName());
        
        return ProductDto.fromEntity(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        
        productRepository.delete(product);
        log.info("Product deleted: {}", product.getName());
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
