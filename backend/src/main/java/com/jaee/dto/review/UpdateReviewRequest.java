package com.jaee.dto.review;

import jakarta.validation.constraints.*;

public record UpdateReviewRequest(
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    Integer rating,

    @Size(max = 200, message = "Title cannot exceed 200 characters")
    String title,

    @Size(max = 2000, message = "Comment cannot exceed 2000 characters")
    String comment
) {}
