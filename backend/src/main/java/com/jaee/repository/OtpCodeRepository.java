package com.jaee.repository;

import com.jaee.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findFirstByMobileNumberOrderByCreatedAtDesc(String mobileNumber);
    
    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM OtpCode o WHERE o.mobileNumber = :mobileNumber")
    void deleteByMobileNumber(String mobileNumber);
}
