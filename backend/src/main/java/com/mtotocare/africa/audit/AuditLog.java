package com.mtotocare.africa.audit;

import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;

/**
 * Persisted audit log entry (NFR-023, NFR-061, NFR-067).
 * Auto-written whenever an admin (or any other security-sensitive actor)
 * makes a change. Rendered on the web admin "View Audit" page.
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_user", columnList = "user_email"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_entity", columnList = "entity_type,entity_id"),
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "action", nullable = false, length = 80)
    private String action;

    @Column(name = "entity_type", length = 80)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "details", length = 1000)
    private String details;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;
}
