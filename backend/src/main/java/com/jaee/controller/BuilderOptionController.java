package com.jaee.controller;

import com.jaee.dto.builder.BuilderOptionDto;
import com.jaee.dto.common.ApiResponse;
import com.jaee.service.BuilderOptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/builder-options")
@RequiredArgsConstructor
@Tag(name = "Builder Options", description = "Options for Custom Candle and Gift Hamper builders")
public class BuilderOptionController {

    private final BuilderOptionService builderOptionService;

    @GetMapping("/{builderType}/active")
    @Operation(summary = "Get active options (public)", description = "Get active options for a builder type. Optionally filter by optionType query param.")
    public ResponseEntity<ApiResponse<List<BuilderOptionDto>>> getActiveOptions(
            @PathVariable String builderType,
            @RequestParam(required = false) String optionType
    ) {
        List<BuilderOptionDto> options = builderOptionService.getActiveOptions(builderType, optionType);
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    @GetMapping("/admin/{builderType}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all options by builder (admin)", description = "Get all options grouped by type for a builder")
    public ResponseEntity<ApiResponse<Map<String, List<BuilderOptionDto>>>> getAllOptionsByBuilder(
            @PathVariable String builderType
    ) {
        Map<String, List<BuilderOptionDto>> options = builderOptionService.getAllOptionsByBuilder(builderType);
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    @GetMapping("/admin/{builderType}/{optionType}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all options by builder and type (admin)")
    public ResponseEntity<ApiResponse<List<BuilderOptionDto>>> getAllOptionsByBuilderAndType(
            @PathVariable String builderType,
            @PathVariable String optionType
    ) {
        List<BuilderOptionDto> options = builderOptionService.getAllOptionsByBuilderAndType(builderType, optionType);
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create option (admin)")
    public ResponseEntity<ApiResponse<BuilderOptionDto>> createOption(
            @Valid @RequestBody BuilderOptionDto dto
    ) {
        BuilderOptionDto created = builderOptionService.createOption(dto);
        return ResponseEntity.ok(ApiResponse.success("Option created", created));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update option (admin)")
    public ResponseEntity<ApiResponse<BuilderOptionDto>> updateOption(
            @PathVariable Long id,
            @Valid @RequestBody BuilderOptionDto dto
    ) {
        BuilderOptionDto updated = builderOptionService.updateOption(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Option updated", updated));
    }

    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Toggle active status (admin)")
    public ResponseEntity<ApiResponse<BuilderOptionDto>> toggleActive(@PathVariable Long id) {
        BuilderOptionDto updated = builderOptionService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success("Status toggled", updated));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete option (admin)")
    public ResponseEntity<ApiResponse<Void>> deleteOption(@PathVariable Long id) {
        builderOptionService.deleteOption(id);
        return ResponseEntity.ok(ApiResponse.success("Option deleted", null));
    }
}
