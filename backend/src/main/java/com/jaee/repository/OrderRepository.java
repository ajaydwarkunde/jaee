package com.jaee.repository;

import com.jaee.entity.Order;
import com.jaee.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id AND o.user = :user")
    Optional<Order> findByIdAndUserWithItems(@Param("id") Long id, @Param("user") User user);
    
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.razorpayOrderId = :orderId")
    Optional<Order> findByRazorpayOrderIdWithItems(@Param("orderId") String orderId);
}
