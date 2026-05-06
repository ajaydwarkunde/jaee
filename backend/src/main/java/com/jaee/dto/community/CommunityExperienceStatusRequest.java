package com.jaee.dto.community;

import com.jaee.entity.CommunityExperience;
import jakarta.validation.constraints.NotNull;

public record CommunityExperienceStatusRequest(
        @NotNull CommunityExperience.Status status
) {}
