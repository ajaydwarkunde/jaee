package com.jaee.repository;

import com.jaee.entity.CustomCandleRequest;
import com.jaee.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomCandleRequestRepository extends JpaRepository<CustomCandleRequest, Long> {
    List<CustomCandleRequest> findByUserOrderByCreatedAtDesc(User user);

    List<CustomCandleRequest> findAllByOrderByCreatedAtDesc();
}
