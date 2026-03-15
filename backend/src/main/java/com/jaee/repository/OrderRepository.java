package com.jaee.repository;

import com.jaee.entity.Order;
import com.jaee.entity.StoreType;
import com.jaee.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id AND o.user = :user")
    Optional<Order> findByIdAndUserWithItems(@Param("id") Long id, @Param("user") User user);
    
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.razorpayOrderId = :orderId")
    Optional<Order> findByRazorpayOrderIdWithItems(@Param("orderId") String orderId);
    
    // Admin queries
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user ORDER BY o.createdAt DESC")
    Page<Order> findAllWithUser(Pageable pageable);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user WHERE o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByStatusWithUser(@Param("status") Order.OrderStatus status, Pageable pageable);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.user WHERE o.id = :id")
    Optional<Order> findByIdWithItemsAndUser(@Param("id") Long id);
    
    // Count by status for dashboard
    long countByStatus(Order.OrderStatus status);

    // Store-level analytics: revenue and item count by store type for paid/shipped/fulfilled orders
    @Query("""
        SELECT c.storeType, 
               COALESCE(SUM(oi.priceSnapshot * oi.qty), 0), 
               COALESCE(SUM(oi.qty), 0),
               COUNT(DISTINCT o.id)
        FROM OrderItem oi
        JOIN oi.order o
        JOIN oi.product p
        JOIN p.categories c
        WHERE o.status IN :statuses
          AND c.storeType IS NOT NULL
        GROUP BY c.storeType
    """)
    List<Object[]> getRevenueByStoreType(@Param("statuses") List<Order.OrderStatus> statuses);

    // Top products by store type
    @Query("""
        SELECT p.name, COALESCE(SUM(oi.qty), 0), COALESCE(SUM(oi.priceSnapshot * oi.qty), 0)
        FROM OrderItem oi
        JOIN oi.order o
        JOIN oi.product p
        JOIN p.categories c
        WHERE o.status IN :statuses
          AND c.storeType = :storeType
        GROUP BY p.id, p.name
        ORDER BY SUM(oi.qty) DESC
    """)
    List<Object[]> getTopProductsByStoreType(@Param("storeType") StoreType storeType, @Param("statuses") List<Order.OrderStatus> statuses, Pageable pageable);
}
