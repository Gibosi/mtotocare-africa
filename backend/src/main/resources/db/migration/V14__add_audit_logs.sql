-- V14: Audit logs enhancement (NFR-023, NFR-067)
-- Extends the audit_logs table created in V1.

ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS user_email VARCHAR(150);

CREATE INDEX IF NOT EXISTS idx_audit_user_email
    ON audit_logs (user_email);

CREATE INDEX IF NOT EXISTS idx_audit_entity
    ON audit_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_date
    ON audit_logs (created_at);