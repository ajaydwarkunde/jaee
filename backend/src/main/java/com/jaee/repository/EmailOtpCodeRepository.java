package com.jaee.repository;

import com.jaee.entity.EmailOtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailOtpCodeRepository extends JpaRepository<EmailOtpCode, Long> {
    Optional<EmailOtpCode> findFirstByEmailOrderByCreatedAtDesc(String email);

    @Modifying
    @Query("DELETE FROM EmailOtpCode o WHERE o.email = :email")
    void deleteByEmail(String email);
}
