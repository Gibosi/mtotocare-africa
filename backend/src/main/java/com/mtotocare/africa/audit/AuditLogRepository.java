package com.mtotocare.africa.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByIdDesc(Pageable pageable);
    Page<AuditLog> findByUserEmailContainingIgnoreCaseOrderByIdDesc(String email, Pageable pageable);
}
