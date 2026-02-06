package com.jaee.controller;

import com.jaee.dto.address.AddressCreateRequest;
import com.jaee.dto.address.AddressDto;
import com.jaee.dto.common.ApiResponse;
import com.jaee.entity.User;
import com.jaee.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@Tag(name = "Addresses", description = "Address management")
@SecurityRequirement(name = "bearerAuth")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Get current user's addresses")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses(
            @AuthenticationPrincipal User user
    ) {
        List<AddressDto> addresses = addressService.getUserAddresses(user);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping
    @Operation(summary = "Create a new address")
    public ResponseEntity<ApiResponse<AddressDto>> createAddress(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddressCreateRequest request
    ) {
        AddressDto address = addressService.createAddress(user, request);
        return ResponseEntity.ok(ApiResponse.success("Address added successfully", address));
    }

    @PutMapping("/{addressId}")
    @Operation(summary = "Update an address")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressCreateRequest request
    ) {
        AddressDto address = addressService.updateAddress(user, addressId, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated", address));
    }

    @DeleteMapping("/{addressId}")
    @Operation(summary = "Delete an address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long addressId
    ) {
        addressService.deleteAddress(user, addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @PatchMapping("/{addressId}/default")
    @Operation(summary = "Set an address as default")
    public ResponseEntity<ApiResponse<AddressDto>> setDefault(
            @AuthenticationPrincipal User user,
            @PathVariable Long addressId
    ) {
        AddressDto address = addressService.setDefault(user, addressId);
        return ResponseEntity.ok(ApiResponse.success("Default address updated", address));
    }
}
