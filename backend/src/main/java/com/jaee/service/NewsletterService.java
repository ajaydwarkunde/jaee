package com.jaee.service;

import com.jaee.entity.NewsletterSubscriber;
import com.jaee.repository.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsletterService {

    private final NewsletterSubscriberRepository subscriberRepository;

    /**
     * Subscribe an email to the newsletter
     */
    @Transactional
    public NewsletterSubscriber subscribe(String email, String source) {
        String normalizedEmail = email.toLowerCase().trim();
        
        // Check if already subscribed
        return subscriberRepository.findByEmail(normalizedEmail)
                .map(existing -> {
                    // Reactivate if previously unsubscribed
                    if (!existing.getIsActive()) {
                        existing.setIsActive(true);
                        existing.setUnsubscribedAt(null);
                        existing.setSubscribedAt(LocalDateTime.now());
                        log.info("Reactivated newsletter subscription for: {}", normalizedEmail);
                        return subscriberRepository.save(existing);
                    }
                    log.info("Email already subscribed: {}", normalizedEmail);
                    return existing;
                })
                .orElseGet(() -> {
                    NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
                            .email(normalizedEmail)
                            .source(source != null ? source : "website")
                            .build();
                    log.info("New newsletter subscription: {}", normalizedEmail);
                    return subscriberRepository.save(subscriber);
                });
    }

    /**
     * Unsubscribe an email from the newsletter
     */
    @Transactional
    public boolean unsubscribe(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        
        return subscriberRepository.findByEmail(normalizedEmail)
                .map(subscriber -> {
                    subscriber.setIsActive(false);
                    subscriber.setUnsubscribedAt(LocalDateTime.now());
                    subscriberRepository.save(subscriber);
                    log.info("Unsubscribed from newsletter: {}", normalizedEmail);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Check if email is subscribed
     */
    public boolean isSubscribed(String email) {
        return subscriberRepository.findByEmail(email.toLowerCase().trim())
                .map(NewsletterSubscriber::getIsActive)
                .orElse(false);
    }

    /**
     * Get all active subscribers
     */
    public List<NewsletterSubscriber> getActiveSubscribers() {
        return subscriberRepository.findByIsActiveTrue();
    }

    /**
     * Get count of active subscribers
     */
    public long getActiveSubscriberCount() {
        return subscriberRepository.countByIsActiveTrue();
    }
}
