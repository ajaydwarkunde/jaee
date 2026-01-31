package com.jaee.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.jaee.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class ImageService {

    private final Cloudinary cloudinary;

    public ImageService(@org.springframework.lang.Nullable Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Value("${app.cloudinary.folder:jaee}")
    private String folder;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Upload an image to Cloudinary
     * @param file The image file to upload
     * @param subfolder Optional subfolder (e.g., "products", "categories")
     * @return The URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String subfolder) {
        validateFile(file);

        if (cloudinary == null) {
            log.warn("Cloudinary not configured. Using placeholder image URL.");
            return generatePlaceholderUrl(file.getOriginalFilename());
        }

        try {
            String publicId = generatePublicId(subfolder, file.getOriginalFilename());
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", folder,
                    "resource_type", "image",
                    "overwrite", true,
                    "transformation", ObjectUtils.asMap(
                            "quality", "auto:good",
                            "fetch_format", "auto"
                    )
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Upload a product image with optimized transformations
     */
    public String uploadProductImage(MultipartFile file) {
        validateFile(file);

        if (cloudinary == null) {
            return generatePlaceholderUrl(file.getOriginalFilename());
        }

        try {
            String publicId = generatePublicId("products", file.getOriginalFilename());
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", folder + "/products",
                    "resource_type", "image",
                    "overwrite", true,
                    "eager", Arrays.asList(
                            ObjectUtils.asMap(
                                    "width", 800,
                                    "height", 800,
                                    "crop", "fill",
                                    "quality", "auto:good"
                            ),
                            ObjectUtils.asMap(
                                    "width", 400,
                                    "height", 400,
                                    "crop", "fill",
                                    "quality", "auto:good"
                            )
                    )
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Product image uploaded: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Failed to upload product image", e);
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Upload a category image
     */
    public String uploadCategoryImage(MultipartFile file) {
        validateFile(file);

        if (cloudinary == null) {
            return generatePlaceholderUrl(file.getOriginalFilename());
        }

        try {
            String publicId = generatePublicId("categories", file.getOriginalFilename());
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", folder + "/categories",
                    "resource_type", "image",
                    "overwrite", true,
                    "transformation", ObjectUtils.asMap(
                            "width", 600,
                            "height", 400,
                            "crop", "fill",
                            "quality", "auto:good"
                    )
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Category image uploaded: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Failed to upload category image", e);
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Delete an image from Cloudinary
     */
    public void deleteImage(String imageUrl) {
        if (cloudinary == null || imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extract public ID from URL
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Image deleted: {}", publicId);
            }
        } catch (IOException e) {
            log.warn("Failed to delete image from Cloudinary: {}", e.getMessage());
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

    private String generatePublicId(String subfolder, String originalFilename) {
        String baseName = originalFilename != null 
                ? originalFilename.replaceAll("\\.[^.]+$", "") 
                : "image";
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        
        if (subfolder != null && !subfolder.isEmpty()) {
            return subfolder + "/" + baseName + "_" + uniqueId;
        }
        return baseName + "_" + uniqueId;
    }

    private String extractPublicId(String imageUrl) {
        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
        try {
            String[] parts = imageUrl.split("/upload/");
            if (parts.length > 1) {
                String path = parts[1];
                // Remove version prefix (v123456/)
                path = path.replaceFirst("v\\d+/", "");
                // Remove file extension
                return path.replaceAll("\\.[^.]+$", "");
            }
        } catch (Exception e) {
            log.warn("Could not extract public ID from URL: {}", imageUrl);
        }
        return null;
    }

    private String generatePlaceholderUrl(String filename) {
        // Generate a placeholder URL when Cloudinary is not configured
        return "https://placehold.co/800x800/F5E6E0/2D2D2D?text=" + 
               (filename != null ? filename.replaceAll("\\.[^.]+$", "") : "Image");
    }
}
