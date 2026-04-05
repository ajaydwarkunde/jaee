package com.jaee.service;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.product.ProductCreateRequest;
import com.jaee.dto.product.ProductDto;
import com.jaee.entity.Category;
import com.jaee.entity.Product;
import com.jaee.entity.StoreType;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.CategoryRepository;
import com.jaee.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private StockNotificationService stockNotificationService;

    @InjectMocks
    private ProductService productService;

    @Test
    void getProducts_callsFindWithFilters() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.ASC, "createdAt"));
        Product product = createProduct(1L, "Product", "product", BigDecimal.TEN);
        Page<Product> productPage = new PageImpl<>(List.of(product), pageable, 1);

        when(productRepository.findWithFilters(
                isNull(), isNull(), isNull(), eq(""), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(productPage);

        PageResponse<ProductDto> result = productService.getProducts(
                null, null, null, "", null, null, "createdAt", "ASC", 0, 10
        );

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Product");
        verify(productRepository).findWithFilters(
                isNull(), isNull(), isNull(), eq(""), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    void getProductBySlug_returnsProduct() {
        Product product = createProduct(1L, "Test Product", "test-product", BigDecimal.TEN);
        when(productRepository.findBySlugWithDetails("test-product")).thenReturn(Optional.of(product));

        ProductDto result = productService.getProductBySlug("test-product");

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSlug()).isEqualTo("test-product");
    }

    @Test
    void getProductBySlug_throwsWhenNotFound() {
        when(productRepository.findBySlugWithDetails("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductBySlug("missing"))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void getProductById_returnsProduct() {
        Product product = createProduct(1L, "Product", "product", BigDecimal.valueOf(99));
        when(productRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(product));

        ProductDto result = productService.getProductById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(99));
    }

    @Test
    void getProductById_throwsWhenNotFound() {
        when(productRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void getFeaturedProducts_returnsListLimitedByParam() {
        Product p1 = createProduct(1L, "A", "a", BigDecimal.ONE);
        Product p2 = createProduct(2L, "B", "b", BigDecimal.TEN);
        Pageable pageable = PageRequest.of(0, 3);
        when(productRepository.findFeaturedProducts(pageable)).thenReturn(List.of(p1, p2));

        List<ProductDto> result = productService.getFeaturedProducts(3);

        assertThat(result).hasSize(2);
        verify(productRepository).findFeaturedProducts(pageable);
    }

    @Test
    void getOnSaleProducts_returnsPaginated() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        Product product = createProduct(1L, "Sale", "sale", BigDecimal.TEN);
        product.setCompareAtPrice(BigDecimal.valueOf(15));
        Page<Product> page = new PageImpl<>(List.of(product), pageable, 1);

        when(productRepository.findOnSaleProducts(pageable)).thenReturn(page);

        PageResponse<ProductDto> result = productService.getOnSaleProducts(0, 10);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getPage()).isZero();
        verify(productRepository).findOnSaleProducts(pageable);
    }

    @Test
    void getRelatedProducts_findsProductsInSameCategoriesExcludingSelf() {
        Category cat = Category.builder().id(1L).name("Cat").slug("cat").storeType(StoreType.CANDLE).build();
        Product product = createProduct(1L, "Product", "product", BigDecimal.TEN);
        product.setCategories(Set.of(cat));

        Product related = createProduct(2L, "Related", "related", BigDecimal.ONE);
        related.setCategories(Set.of(cat));

        Pageable pageable = PageRequest.of(0, 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.findRelatedProducts(Set.of(1L), 1L, pageable)).thenReturn(List.of(related));

        List<ProductDto> result = productService.getRelatedProducts(1L, 5);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(2L);
        verify(productRepository).findRelatedProducts(Set.of(1L), 1L, pageable);
    }

    @Test
    void createProduct_generatesSlugResolvesCategoriesReturnsDto() {
        ProductCreateRequest request = new ProductCreateRequest();
        request.setName("New Product");
        request.setDescription("Desc");
        request.setPrice(BigDecimal.valueOf(49.99));
        request.setCategoryIds(List.of(1L));
        request.setStockQty(10);
        request.setActive(true);

        Category category = Category.builder().id(1L).name("Cat").slug("cat").storeType(StoreType.CANDLE).build();
        when(productRepository.existsBySlug("new-product")).thenReturn(false);
        when(categoryRepository.findAllById(List.of(1L))).thenReturn(List.of(category));

        Product savedProduct = createProduct(1L, "New Product", "new-product", BigDecimal.valueOf(49.99));
        savedProduct.setCategories(Set.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        ProductDto result = productService.createProduct(request);

        assertThat(result.getName()).isEqualTo("New Product");
        assertThat(result.getSlug()).isEqualTo("new-product");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_ensuresUniqueSlugByAppendingCounter() {
        ProductCreateRequest request = new ProductCreateRequest();
        request.setName("Duplicate");
        request.setPrice(BigDecimal.TEN);
        request.setStockQty(1);
        request.setActive(true);

        when(productRepository.existsBySlug("duplicate")).thenReturn(true);
        when(productRepository.existsBySlug("duplicate-1")).thenReturn(false);

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        ProductDto result = productService.createProduct(request);

        assertThat(result.getSlug()).isEqualTo("duplicate-1");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_notifiesWhenStockWentFromZeroToPositive() {
        Product product = createProduct(1L, "Product", "product", BigDecimal.TEN);
        product.setStockQty(0);

        ProductCreateRequest request = new ProductCreateRequest();
        request.setName("Product");
        request.setPrice(BigDecimal.TEN);
        request.setStockQty(5);
        request.setActive(true);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        productService.updateProduct(1L, request);

        verify(stockNotificationService).notifySubscribers(1L);
    }

    @Test
    void updateProduct_doesNotNotifyWhenStockWasAlreadyPositive() {
        Product product = createProduct(1L, "Product", "product", BigDecimal.TEN);
        product.setStockQty(5);

        ProductCreateRequest request = new ProductCreateRequest();
        request.setName("Product");
        request.setPrice(BigDecimal.TEN);
        request.setStockQty(10);
        request.setActive(true);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        productService.updateProduct(1L, request);

        verify(stockNotificationService, never()).notifySubscribers(any());
    }

    @Test
    void deleteProduct_deletesExisting() {
        Product product = createProduct(1L, "Product", "product", BigDecimal.TEN);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.deleteProduct(1L);

        verify(productRepository).delete(product);
    }

    @Test
    void deleteProduct_throwsWhenNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.deleteProduct(999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Product not found");
        verify(productRepository, never()).delete(any());
    }

    private Product createProduct(Long id, String name, String slug, BigDecimal price) {
        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .price(price)
                .stockQty(10)
                .active(true)
                .build();
        product.setId(id);
        return product;
    }
}
