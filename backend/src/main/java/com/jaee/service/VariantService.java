package com.jaee.service;

import com.jaee.dto.variant.VariantCreateRequest;
import com.jaee.dto.variant.VariantDto;
import com.jaee.entity.Product;
import com.jaee.entity.ProductVariant;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<VariantDto> getVariantsByProductId(Long productId) {
        return variantRepository.findByProductIdWithDetails(productId).stream()
                .map(VariantDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public VariantDto createVariant(Long productId, VariantCreateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.getSku())
                .price(request.getPrice())
                .compareAtPrice(request.getCompareAtPrice())
                .stockQty(request.getStockQty())
                .active(request.getActive())
                .optionValues(request.getOptionValues() != null ? request.getOptionValues() : java.util.Map.of())
                .images(request.getImages() != null ? request.getImages() : List.of())
                .build();

        variantRepository.save(variant);
        log.info("Variant created for product {}: {}", productId, request.getOptionValues());
        return VariantDto.fromEntity(variant);
    }

    @Transactional
    public VariantDto updateVariant(Long variantId, VariantCreateRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new NotFoundException("Variant not found"));

        variant.setSku(request.getSku());
        variant.setPrice(request.getPrice());
        variant.setCompareAtPrice(request.getCompareAtPrice());
        variant.setStockQty(request.getStockQty());
        variant.setActive(request.getActive());
        if (request.getOptionValues() != null) {
            variant.getOptionValues().clear();
            variant.getOptionValues().putAll(request.getOptionValues());
        }
        if (request.getImages() != null) {
            variant.getImages().clear();
            variant.getImages().addAll(request.getImages());
        }

        variantRepository.save(variant);
        log.info("Variant {} updated", variantId);
        return VariantDto.fromEntity(variant);
    }

    @Transactional
    public void deleteVariant(Long variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new NotFoundException("Variant not found"));
        variantRepository.delete(variant);
        log.info("Variant {} deleted", variantId);
    }

    @Transactional
    public List<VariantDto> bulkSaveVariants(Long productId, List<VariantCreateRequest> requests) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        variantRepository.deleteAllByProductId(productId);
        variantRepository.flush();

        List<ProductVariant> variants = requests.stream().map(req -> ProductVariant.builder()
                .product(product)
                .sku(req.getSku())
                .price(req.getPrice())
                .compareAtPrice(req.getCompareAtPrice())
                .stockQty(req.getStockQty())
                .active(req.getActive() != null ? req.getActive() : true)
                .optionValues(req.getOptionValues() != null ? req.getOptionValues() : java.util.Map.of())
                .images(req.getImages() != null ? req.getImages() : List.of())
                .build()
        ).collect(Collectors.toList());

        variantRepository.saveAll(variants);
        log.info("Bulk saved {} variants for product {}", variants.size(), productId);

        return variants.stream().map(VariantDto::fromEntity).collect(Collectors.toList());
    }
}
