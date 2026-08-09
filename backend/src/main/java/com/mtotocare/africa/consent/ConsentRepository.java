package com.mtotocare.africa.consent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsentRepository extends JpaRepository<Consent, Long> {
    List<Consent> findByUserIdAndDeletedAtIsNull(Long userId);
    Optional<Consent> findByUserIdAndConsentTypeAndDeletedAtIsNull(Long userId, String consentType);
}
