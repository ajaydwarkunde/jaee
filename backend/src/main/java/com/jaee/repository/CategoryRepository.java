package com.jaee.repository;

import com.jaee.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT DISTINCT c FROM Category c JOIN c.products p WHERE p.active = true ORDER BY c.name ASC")
    List<Category> findWithActiveProductsOrderedByName();
}
