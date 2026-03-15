package com.jaee.controller;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.product.ProductDto;
import com.jaee.exception.GlobalExceptionHandler;
import com.jaee.exception.NotFoundException;
import com.jaee.service.ProductService;
import com.jaee.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@org.springframework.context.annotation.Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void getProducts_returnsProductsWithFilters() throws Exception {
        ProductDto product = ProductDto.builder()
                .id(1L)
                .name("Test Product")
                .slug("test-product")
                .price(BigDecimal.valueOf(29.99))
                .build();
        PageResponse<ProductDto> pageResponse = PageResponse.<ProductDto>builder()
                .content(List.of(product))
                .page(0)
                .size(12)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(productService.getProducts(any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/products")
                        .param("categoryId", "1")
                        .param("minPrice", "10")
                        .param("maxPrice", "50")
                        .param("search", "candle")
                        .param("sortBy", "price")
                        .param("sortDir", "asc")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value(1))
                .andExpect(jsonPath("$.data.content[0].name").value("Test Product"))
                .andExpect(jsonPath("$.data.content[0].slug").value("test-product"))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(12));

        verify(productService).getProducts(1L, BigDecimal.valueOf(10), BigDecimal.valueOf(50),
                "candle", "price", "asc", 0, 12);
    }

    @Test
    void getProductBySlug_returnsProduct() throws Exception {
        ProductDto product = ProductDto.builder()
                .id(1L)
                .name("Candle")
                .slug("candle")
                .price(BigDecimal.valueOf(19.99))
                .build();

        when(productService.getProductBySlug("candle")).thenReturn(product);

        mockMvc.perform(get("/products/candle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Candle"))
                .andExpect(jsonPath("$.data.slug").value("candle"));

        verify(productService).getProductBySlug("candle");
    }

    @Test
    void getProductBySlug_returns404WhenNotFound() throws Exception {
        when(productService.getProductBySlug("nonexistent")).thenThrow(new NotFoundException("Product not found"));

        mockMvc.perform(get("/products/nonexistent"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Product not found"));

        verify(productService).getProductBySlug("nonexistent");
    }

    @Test
    void getFeaturedProducts_returnsFeaturedProducts() throws Exception {
        ProductDto product = ProductDto.builder()
                .id(1L)
                .name("Featured")
                .slug("featured")
                .price(BigDecimal.valueOf(39.99))
                .build();

        when(productService.getFeaturedProducts(8)).thenReturn(List.of(product));

        mockMvc.perform(get("/products/featured").param("limit", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].name").value("Featured"));

        verify(productService).getFeaturedProducts(8);
    }

    @Test
    void getOnSaleProducts_returnsOnSaleProducts() throws Exception {
        ProductDto product = ProductDto.builder()
                .id(1L)
                .name("Sale Item")
                .slug("sale-item")
                .price(BigDecimal.valueOf(14.99))
                .compareAtPrice(BigDecimal.valueOf(24.99))
                .build();
        PageResponse<ProductDto> pageResponse = PageResponse.<ProductDto>builder()
                .content(List.of(product))
                .page(0)
                .size(12)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(productService.getOnSaleProducts(0, 12)).thenReturn(pageResponse);

        mockMvc.perform(get("/products/on-sale").param("page", "0").param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Sale Item"));

        verify(productService).getOnSaleProducts(0, 12);
    }

    @Test
    void getRelatedProducts_returnsRelatedProducts() throws Exception {
        ProductDto related = ProductDto.builder()
                .id(2L)
                .name("Related Candle")
                .slug("related-candle")
                .price(BigDecimal.valueOf(19.99))
                .build();

        when(productService.getRelatedProducts(1L, 4)).thenReturn(List.of(related));

        mockMvc.perform(get("/products/1/related").param("limit", "4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(2))
                .andExpect(jsonPath("$.data[0].name").value("Related Candle"));

        verify(productService).getRelatedProducts(1L, 4);
    }
}
