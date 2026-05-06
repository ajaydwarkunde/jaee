package com.jaee.controller;

import com.jaee.dto.community.*;
import com.jaee.entity.User;
import com.jaee.service.CommunityExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/community/experiences")
@RequiredArgsConstructor
@Tag(name = "Community experiences", description = "Homepage Share Your Experience stories")
public class CommunityExperienceController {

    private final CommunityExperienceService communityExperienceService;

    @GetMapping
    @Operation(summary = "List approved stories (plus sign-in user's pending)")
    public ResponseEntity<List<CommunityExperienceDto>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(communityExperienceService.listPublic(user));
    }

    @PostMapping
    @Operation(summary = "Submit a story (authenticated)")
    public ResponseEntity<CommunityExperienceDto> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateCommunityExperienceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(communityExperienceService.create(user, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update own story")
    public ResponseEntity<CommunityExperienceDto> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommunityExperienceRequest request) {
        return ResponseEntity.ok(communityExperienceService.update(user, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete own story")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        communityExperienceService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
