package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.service.ImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
@Tag(name = "Images", description = "Image upload endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ImageController {

    private final ImageService imageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a single image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "general") String type
    ) {
        String imageUrl;
        switch (type.toLowerCase()) {
            case "product":
                imageUrl = imageService.uploadProductImage(file);
                break;
            case "category":
                imageUrl = imageService.uploadCategoryImage(file);
                break;
            default:
                imageUrl = imageService.uploadImage(file, type);
        }

        ImageUploadResponse response = new ImageUploadResponse(imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
    }

    @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MultipleImageUploadResponse>> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "type", defaultValue = "product") String type
    ) {
        List<String> urls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            String imageUrl;
            switch (type.toLowerCase()) {
                case "product":
                    imageUrl = imageService.uploadProductImage(file);
                    break;
                case "category":
                    imageUrl = imageService.uploadCategoryImage(file);
                    break;
                default:
                    imageUrl = imageService.uploadImage(file, type);
            }
            urls.add(imageUrl);
        }

        MultipleImageUploadResponse response = new MultipleImageUploadResponse(urls);
        return ResponseEntity.ok(ApiResponse.success("Images uploaded successfully", response));
    }

    @DeleteMapping
    @Operation(summary = "Delete an image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@RequestParam("url") String imageUrl) {
        imageService.deleteImage(imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
    }

    // Response DTOs
    public record ImageUploadResponse(String url) {}
    public record MultipleImageUploadResponse(List<String> urls) {}
}
