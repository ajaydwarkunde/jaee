package com.jaee.controller;

import com.jaee.dto.community.CommunityExperienceDto;
import com.jaee.dto.community.CommunityExperienceStatusRequest;
import com.jaee.entity.User;
import com.jaee.service.CommunityExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/community-experiences")
@RequiredArgsConstructor
@Tag(name = "Admin — Community experiences", description = "Moderate homepage stories")
public class AdminCommunityExperienceController {

    private final CommunityExperienceService communityExperienceService;

    @GetMapping
    @Operation(summary = "List all stories")
    public ResponseEntity<List<CommunityExperienceDto>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(communityExperienceService.listAllForAdmin(user));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Approve or reject a story")
    public ResponseEntity<CommunityExperienceDto> updateStatus(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody CommunityExperienceStatusRequest request) {
        return ResponseEntity.ok(communityExperienceService.updateStatus(user, id, request.status()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove any story (including curated)")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        communityExperienceService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
