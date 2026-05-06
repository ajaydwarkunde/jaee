package com.jaee.dto.community;

import com.jaee.entity.CommunityExperience;

import java.time.LocalDateTime;

public record CommunityExperienceDto(
        Long id,
        String authorName,
        String location,
        String body,
        String status,
        boolean curated,
        LocalDateTime createdAt,
        boolean mine,
        boolean canEdit,
        boolean canDelete
) {
    public static CommunityExperienceDto fromEntity(CommunityExperience e, Long currentUserId) {
        Long uid = e.getUser() != null ? e.getUser().getId() : null;
        boolean mine = currentUserId != null && uid != null && uid.equals(currentUserId);
        boolean pendingOrApproved =
                e.getStatus() == CommunityExperience.Status.PENDING
                        || e.getStatus() == CommunityExperience.Status.APPROVED;
        boolean nonCuratedUserPost = uid != null && !Boolean.TRUE.equals(e.getCurated());
        boolean canEdit = mine && nonCuratedUserPost && pendingOrApproved;
        boolean canDelete = mine && nonCuratedUserPost && pendingOrApproved;

        return new CommunityExperienceDto(
                e.getId(),
                e.getAuthorName(),
                e.getLocation(),
                e.getBody(),
                e.getStatus().name(),
                Boolean.TRUE.equals(e.getCurated()),
                e.getCreatedAt(),
                mine,
                canEdit,
                canDelete
        );
    }
}
