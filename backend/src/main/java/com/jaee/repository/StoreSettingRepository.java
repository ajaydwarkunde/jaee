package com.jaee.repository;

import com.jaee.entity.StoreSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreSettingRepository extends JpaRepository<StoreSetting, Long> {
    
    Optional<StoreSetting> findByKey(String key);
    
    List<StoreSetting> findAllByOrderByKeyAsc();
    
    boolean existsByKey(String key);
}
