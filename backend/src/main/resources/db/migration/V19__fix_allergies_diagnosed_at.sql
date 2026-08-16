-- V19: Add diagnosed_at to allergies
-- Aligns the database schema with the Allergy JPA entity.

ALTER TABLE allergies
    ADD COLUMN IF NOT EXISTS diagnosed_at TIMESTAMP(6);