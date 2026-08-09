package com.mtotocare.africa.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhoneOtpTokenRepository extends JpaRepository<PhoneOtpToken, Long> {
    @Query("SELECT o FROM PhoneOtpToken o WHERE o.phoneNumber = :phone AND o.code = :code AND o.usedAt IS NULL ORDER BY o.createdAt DESC")
    Optional<PhoneOtpToken> findLatestValid(@Param("phone") String phone, @Param("code") String code);
}
