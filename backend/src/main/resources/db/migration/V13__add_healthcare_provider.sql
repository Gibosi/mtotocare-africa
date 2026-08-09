-- =====================================================================
-- V13: Add healthcare_provider column to users table
-- Marks whether a user is a healthcare worker (doctor, nurse, etc.)
-- Added in schema v1.1 (July 2026)
-- =====================================================================

ALTER TABLE users ADD COLUMN healthcare_provider BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: any user with a DOCTOR, NURSE, MIDWIFE, CHW, or HEALTHCARE_PROVIDER role
-- is automatically a healthcare provider.
UPDATE users u
SET healthcare_provider = TRUE
WHERE EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role IN ('DOCTOR', 'NURSE', 'MIDWIFE', 'CHW', 'HEALTHCARE_PROVIDER', 'ADMIN')
);

CREATE INDEX idx_user_healthcare_provider ON users(healthcare_provider);
