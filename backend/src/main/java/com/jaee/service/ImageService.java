package com.jaee.service;

import com.jaee.config.SupabaseConfig;
import com.jaee.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final OkHttpClient okHttpClient;
    private final SupabaseConfig supabaseConfig;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Upload an image to Supabase Storage
     * @param file The image file to upload
     * @param folder Folder path (e.g., "products", "categories")
     * @return The public URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) {
        validateFile(file);

        if (!supabaseConfig.isConfigured()) {
            log.warn("Supabase not configured. Using placeholder image URL.");
            return generatePlaceholderUrl(file.getOriginalFilename());
        }

        String fileName = generateFileName(file.getOriginalFilename());
        String filePath = folder + "/" + fileName;

        try {
            // Build the upload URL
            String uploadUrl = String.format("%s/storage/v1/object/%s/%s",
                    supabaseConfig.getSupabaseUrl(),
                    supabaseConfig.getStorageBucket(),
                    filePath);

            // Create request body with file content
            RequestBody requestBody = RequestBody.create(
                    file.getBytes(),
                    MediaType.parse(file.getContentType())
            );

            // Build the request
            Request request = new Request.Builder()
                    .url(uploadUrl)
                    .addHeader("Authorization", "Bearer " + supabaseConfig.getSupabaseKey())
                    .addHeader("Content-Type", file.getContentType())
                    .addHeader("x-upsert", "true") // Overwrite if exists
                    .post(requestBody)
                    .build();

            // Execute request
            try (Response response = okHttpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    log.error("Failed to upload image to Supabase: {} - {}", response.code(), errorBody);
                    throw new BadRequestException("Failed to upload image: " + response.message());
                }

                // Return the public URL
                String publicUrl = String.format("%s/storage/v1/object/public/%s/%s",
                        supabaseConfig.getSupabaseUrl(),
                        supabaseConfig.getStorageBucket(),
                        filePath);

                log.info("Image uploaded successfully: {}", publicUrl);
                return publicUrl;
            }

        } catch (IOException e) {
            log.error("Failed to upload image to Supabase", e);
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Upload a product image
     */
    public String uploadProductImage(MultipartFile file) {
        return uploadImage(file, "products");
    }

    /**
     * Upload a category image
     */
    public String uploadCategoryImage(MultipartFile file) {
        return uploadImage(file, "categories");
    }

    /**
     * Delete an image from Supabase Storage
     */
    public void deleteImage(String imageUrl) {
        if (!supabaseConfig.isConfigured() || imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extract file path from URL
            String filePath = extractFilePath(imageUrl);
            if (filePath == null) {
                log.warn("Could not extract file path from URL: {}", imageUrl);
                return;
            }

            // Build the delete URL
            String deleteUrl = String.format("%s/storage/v1/object/%s/%s",
                    supabaseConfig.getSupabaseUrl(),
                    supabaseConfig.getStorageBucket(),
                    filePath);

            Request request = new Request.Builder()
                    .url(deleteUrl)
                    .addHeader("Authorization", "Bearer " + supabaseConfig.getSupabaseKey())
                    .delete()
                    .build();

            try (Response response = okHttpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    log.info("Image deleted: {}", filePath);
                } else {
                    log.warn("Failed to delete image: {} - {}", response.code(), response.message());
                }
            }

        } catch (IOException e) {
            log.warn("Failed to delete image from Supabase: {}", e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Invalid file type. Allowed types: JPEG, PNG, GIF, WebP");
        }
    }

    private String generateFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    private String extractFilePath(String imageUrl) {
        // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket/folder/file.jpg
        try {
            String marker = "/object/public/" + supabaseConfig.getStorageBucket() + "/";
            int index = imageUrl.indexOf(marker);
            if (index != -1) {
                return imageUrl.substring(index + marker.length());
            }
        } catch (Exception e) {
            log.warn("Could not extract file path from URL: {}", imageUrl);
        }
        return null;
    }

    private String generatePlaceholderUrl(String filename) {
        return "https://placehold.co/800x800/F5E6E0/2D2D2D?text=" +
                (filename != null ? filename.replaceAll("\\.[^.]+$", "") : "Image");
    }
}
