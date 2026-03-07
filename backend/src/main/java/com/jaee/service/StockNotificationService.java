package com.jaee.service;

import com.jaee.entity.Product;
import com.jaee.entity.StockNotification;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.StockNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockNotificationService {

    private final StockNotificationRepository notificationRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    @Transactional
    public StockNotification subscribe(Long productId, String email) {
        String normalizedEmail = email.toLowerCase().trim();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        return notificationRepository.findByProductIdAndEmail(productId, normalizedEmail)
                .map(existing -> {
                    if (!existing.getIsActive() || existing.getNotified()) {
                        existing.setIsActive(true);
                        existing.setNotified(false);
                        existing.setNotifiedAt(null);
                        existing.setCreatedAt(LocalDateTime.now());
                        log.info("Reactivated stock notification for product {} to {}", product.getName(), normalizedEmail);
                        return notificationRepository.save(existing);
                    }
                    log.info("Stock notification already active for product {} to {}", product.getName(), normalizedEmail);
                    return existing;
                })
                .orElseGet(() -> {
                    StockNotification notification = StockNotification.builder()
                            .product(product)
                            .email(normalizedEmail)
                            .build();
                    log.info("New stock notification for product {} to {}", product.getName(), normalizedEmail);
                    return notificationRepository.save(notification);
                });
    }

    public long getWaitlistCount(Long productId) {
        return notificationRepository.countByProductIdAndIsActiveTrueAndNotifiedFalse(productId);
    }

    @Async
    @Transactional
    public void notifySubscribers(Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null || !product.isInStock()) return;

        List<StockNotification> pending = notificationRepository
                .findByProductIdAndIsActiveTrueAndNotifiedFalse(productId);

        if (pending.isEmpty()) return;

        log.info("Sending back-in-stock notifications for '{}' to {} subscribers", product.getName(), pending.size());

        for (StockNotification notification : pending) {
            try {
                emailService.sendBackInStockEmail(notification.getEmail(), product);
                notification.setNotified(true);
                notification.setNotifiedAt(LocalDateTime.now());
                notificationRepository.save(notification);
            } catch (Exception e) {
                log.error("Failed to send back-in-stock email to {}: {}", notification.getEmail(), e.getMessage());
            }
        }
    }
}
