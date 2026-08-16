-- V14: Align existing audit_logs table with AuditLog JPA entity.
-- V1 already created audit_logs, so this migration MUST NOT recreate it.

ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS user_email VARCHAR(150);

DROP INDEX IF EXISTS idx_audit_user;
CREATE INDEX idx_audit_user ON audit_logs (user_email);
CREATE INDEX IF NOT EXISTS idx_audit_action
    ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_entity
    ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_date
    ON audit_logs (created_at);
