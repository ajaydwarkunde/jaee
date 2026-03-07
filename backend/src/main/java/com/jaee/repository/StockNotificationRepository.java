package com.jaee.repository;

import com.jaee.entity.StockNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockNotificationRepository extends JpaRepository<StockNotification, Long> {

    Optional<StockNotification> findByProductIdAndEmail(Long productId, String email);

    List<StockNotification> findByProductIdAndIsActiveTrueAndNotifiedFalse(Long productId);

    long countByProductIdAndIsActiveTrueAndNotifiedFalse(Long productId);

    boolean existsByProductIdAndEmailAndIsActiveTrueAndNotifiedFalse(Long productId, String email);
}
