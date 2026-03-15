package com.jaee.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithAnonymousUser
    void publicEndpoints_return200WithoutAuth() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk());
    }

    @Test
    @WithAnonymousUser
    void getCategories_return200WithoutAuth() throws Exception {
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk());
    }

    @Test
    @WithAnonymousUser
    void getStoreSettings_return200WithoutAuth() throws Exception {
        mockMvc.perform(get("/store/settings"))
                .andExpect(status().isOk());
    }

    @Test
    @WithAnonymousUser
    void authLogin_withEmptyBody_return400Not401() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithAnonymousUser
    void protectedEndpoints_returnForbiddenWithoutAuth() throws Exception {
        mockMvc.perform(get("/cart"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithAnonymousUser
    void getOrders_returnForbiddenWithoutAuth() throws Exception {
        mockMvc.perform(get("/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithAnonymousUser
    void adminEndpoints_returnForbiddenWithoutAuth() throws Exception {
        mockMvc.perform(get("/admin/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "USER")
    void adminEndpoints_return403ForRegularUser() throws Exception {
        mockMvc.perform(get("/admin/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminEndpoints_return200ForAdmin() throws Exception {
        mockMvc.perform(get("/admin/orders"))
                .andExpect(status().isOk());
    }
}
