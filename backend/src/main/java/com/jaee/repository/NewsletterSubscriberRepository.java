package com.jaee.repository;

import com.jaee.entity.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {
    
    Optional<NewsletterSubscriber> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<NewsletterSubscriber> findByIsActiveTrue();
    
    long countByIsActiveTrue();
}
