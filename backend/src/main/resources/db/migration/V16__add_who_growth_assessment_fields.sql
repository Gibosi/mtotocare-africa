-- V16: WHO Child Growth Assessment Module.
--
-- growth_records already had weight_for_age_z_score, height_for_age_z_score,
-- and weight_for_height_z_score from V1 — but the application never
-- computed them ("Simplified — production would use WHO Z-scores" in the
-- old code). This migration adds the remaining fields needed for a real
-- WHO-standards-based assessment: BMI-for-age Z-score, age at measurement
-- (in days, for exact Z-score lookups), risk stratification, a composite
-- health score, growth-trend classification, an AI-generated clinical
-- summary, and clinician-reported danger signs used for emergency
-- detection and referral.
ALTER TABLE growth_records
    ADD COLUMN IF NOT EXISTS age_in_days INT NULL,
    ADD COLUMN IF NOT EXISTS bmi_for_age_z_score DECIMAL(4,2) NULL,
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS health_score INT NULL,
    ADD COLUMN IF NOT EXISTS growth_trend VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS referral_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS emergency_flag BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS oedema BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS severe_dehydration BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_summary VARCHAR(2000) NULL;
