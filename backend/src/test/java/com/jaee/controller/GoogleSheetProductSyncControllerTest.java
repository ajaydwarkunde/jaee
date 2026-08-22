package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.integration.SheetProductSyncRequest;
import com.jaee.dto.integration.SheetProductSyncResponse;
import com.jaee.service.GoogleSheetProductSyncService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleSheetProductSyncControllerTest {

    @Mock
    private GoogleSheetProductSyncService syncService;

    private GoogleSheetProductSyncController controller;

    @BeforeEach
    void setUp() {
        controller = new GoogleSheetProductSyncController(syncService);
        ReflectionTestUtils.setField(controller, "configuredSecret", "test-sync-secret");
    }

    @Test
    void rejectsInvalidSecret() {
        SheetProductSyncRequest request = new SheetProductSyncRequest(List.of());

        ResponseEntity<ApiResponse<SheetProductSyncResponse>> response =
                controller.sync("wrong-secret", request);

        assertThat(response.getStatusCode().value()).isEqualTo(401);
        verify(syncService, never()).sync(request);
    }

    @Test
    void acceptsConfiguredSecret() {
        SheetProductSyncRequest request = new SheetProductSyncRequest(List.of());
        SheetProductSyncResponse result = SheetProductSyncResponse.from(List.of());
        when(syncService.sync(request)).thenReturn(result);

        ResponseEntity<ApiResponse<SheetProductSyncResponse>> response =
                controller.sync("test-sync-secret", request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isEqualTo(result);
        verify(syncService).sync(request);
    }
}
