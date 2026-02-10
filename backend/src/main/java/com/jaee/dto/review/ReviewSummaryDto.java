package com.jaee.dto.review;

import java.util.Map;

public record ReviewSummaryDto(
    Double averageRating,
    Long totalReviews,
    Map<Integer, Long> ratingDistribution // star -> count
) {}
