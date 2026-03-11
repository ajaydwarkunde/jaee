package com.jaee.repository;

import com.jaee.entity.GiftHamperRequest;
import com.jaee.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GiftHamperRequestRepository extends JpaRepository<GiftHamperRequest, Long> {
    List<GiftHamperRequest> findByUserOrderByCreatedAtDesc(User user);

    List<GiftHamperRequest> findAllByOrderByCreatedAtDesc();
}
