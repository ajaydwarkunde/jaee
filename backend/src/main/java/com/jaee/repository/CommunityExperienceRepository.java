package com.jaee.repository;

import com.jaee.entity.CommunityExperience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityExperienceRepository extends JpaRepository<CommunityExperience, Long> {

    List<CommunityExperience> findByStatusOrderByCreatedAtDesc(CommunityExperience.Status status);

    List<CommunityExperience> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, CommunityExperience.Status status);

    List<CommunityExperience> findAllByOrderByCreatedAtDesc();
}
