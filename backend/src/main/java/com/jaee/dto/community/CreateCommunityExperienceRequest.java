package com.jaee.dto.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommunityExperienceRequest(
        @Size(max = 120) String authorName,
        @Size(max = 120) String location,
        @NotBlank @Size(min = 10, max = 2000) String body
) {}
