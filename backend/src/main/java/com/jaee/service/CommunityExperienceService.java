package com.jaee.service;

import com.jaee.dto.community.*;
import com.jaee.entity.CommunityExperience;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.ResourceNotFoundException;
import com.jaee.repository.CommunityExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommunityExperienceService {

    private final CommunityExperienceRepository repository;
    private final StoreSettingService storeSettingService;

    private boolean featureEnabled() {
        return storeSettingService.getBooleanValue("community_experience_enabled", true);
    }

    private boolean autoApprove() {
        return storeSettingService.getBooleanValue("community_experience_auto_approve", false);
    }

    private boolean isAdmin(User user) {
        return user != null && user.getRole() == User.Role.ADMIN;
    }

    /**
     * Homepage: approved stories plus current user's pending submissions.
     */
    public List<CommunityExperienceDto> listPublic(User viewer) {
        if (!featureEnabled()) {
            return List.of();
        }
        Long viewerId = viewer != null ? viewer.getId() : null;
        boolean admin = isAdmin(viewer);

        List<CommunityExperience> approved =
                repository.findByStatusOrderByCreatedAtDesc(CommunityExperience.Status.APPROVED);

        if (viewerId == null || admin) {
            return approved.stream()
                    .map(e -> CommunityExperienceDto.fromEntity(e, viewerId))
                    .toList();
        }

        List<CommunityExperience> pendingMine =
                repository.findByUserIdAndStatusOrderByCreatedAtDesc(
                        viewerId, CommunityExperience.Status.PENDING);

        Map<Long, CommunityExperience> byId = new LinkedHashMap<>();
        for (CommunityExperience e : approved) {
            byId.put(e.getId(), e);
        }
        for (CommunityExperience e : pendingMine) {
            byId.putIfAbsent(e.getId(), e);
        }

        return byId.values().stream()
                .sorted(Comparator.comparing(CommunityExperience::getCreatedAt).reversed())
                .map(e -> CommunityExperienceDto.fromEntity(e, viewerId))
                .toList();
    }

    public List<CommunityExperienceDto> listAllForAdmin(User adminUser) {
        if (!isAdmin(adminUser)) {
            throw new BadRequestException("Admin only");
        }
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(e -> CommunityExperienceDto.fromEntity(e, adminUser.getId()))
                .toList();
    }

    @Transactional
    public CommunityExperienceDto create(User user, CreateCommunityExperienceRequest req) {
        if (!featureEnabled()) {
            throw new BadRequestException("Community experiences are disabled");
        }
        if (user == null) {
            throw new BadRequestException("Sign in to share your experience");
        }

        CommunityExperience.Status initial =
                autoApprove() ? CommunityExperience.Status.APPROVED : CommunityExperience.Status.PENDING;

        String displayName =
                req.authorName() != null && !req.authorName().isBlank()
                        ? req.authorName().trim()
                        : (user.getName() != null && !user.getName().isBlank()
                                ? user.getName()
                                : "Community member");

        CommunityExperience saved =
                repository.save(
                        CommunityExperience.builder()
                                .user(user)
                                .authorName(displayName)
                                .location(req.location() != null ? req.location().trim() : "")
                                .body(req.body().trim())
                                .status(initial)
                                .curated(false)
                                .build());

        return CommunityExperienceDto.fromEntity(saved, user.getId());
    }

    @Transactional
    public CommunityExperienceDto update(User user, Long id, UpdateCommunityExperienceRequest req) {
        CommunityExperience e = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        if (Boolean.TRUE.equals(e.getCurated())) {
            throw new BadRequestException("Featured stories cannot be edited here");
        }
        if (e.getUser() == null || !e.getUser().getId().equals(user.getId())) {
            if (!isAdmin(user)) {
                throw new BadRequestException("You can only edit your own story");
            }
        }
        if (e.getStatus() == CommunityExperience.Status.REJECTED) {
            throw new BadRequestException("Rejected stories cannot be edited");
        }

        String displayName =
                req.authorName() != null && !req.authorName().isBlank()
                        ? req.authorName().trim()
                        : e.getAuthorName();
        e.setAuthorName(displayName);
        e.setLocation(req.location() != null ? req.location().trim() : "");
        e.setBody(req.body().trim());

        CommunityExperience saved = repository.save(e);
        return CommunityExperienceDto.fromEntity(saved, user.getId());
    }

    @Transactional
    public void delete(User user, Long id) {
        CommunityExperience e = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        if (isAdmin(user)) {
            repository.delete(e);
            return;
        }
        if (e.getUser() == null || !e.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own story");
        }
        if (Boolean.TRUE.equals(e.getCurated())) {
            throw new BadRequestException("This story cannot be deleted");
        }
        repository.delete(e);
    }

    @Transactional
    public CommunityExperienceDto updateStatus(User admin, Long id, CommunityExperience.Status status) {
        if (!isAdmin(admin)) {
            throw new BadRequestException("Admin only");
        }
        CommunityExperience e = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        if (status != CommunityExperience.Status.APPROVED
                && status != CommunityExperience.Status.REJECTED
                && status != CommunityExperience.Status.PENDING) {
            throw new BadRequestException("Invalid status");
        }
        e.setStatus(status);
        CommunityExperience saved = repository.save(e);
        return CommunityExperienceDto.fromEntity(saved, admin.getId());
    }
}
