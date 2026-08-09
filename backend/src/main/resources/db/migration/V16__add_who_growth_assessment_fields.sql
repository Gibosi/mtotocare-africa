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
    ADD COLUMN age_in_days INT NULL AFTER measurement_date,
    ADD COLUMN bmi_for_age_z_score DECIMAL(4,2) NULL AFTER weight_for_height_z_score,
    ADD COLUMN risk_level VARCHAR(20) NULL AFTER nutrition_status,
    ADD COLUMN health_score INT NULL AFTER risk_level,
    ADD COLUMN growth_trend VARCHAR(20) NULL AFTER health_score,
    ADD COLUMN referral_recommended BOOLEAN NOT NULL DEFAULT FALSE AFTER growth_trend,
    ADD COLUMN emergency_flag BOOLEAN NOT NULL DEFAULT FALSE AFTER referral_recommended,
    ADD COLUMN oedema BOOLEAN NOT NULL DEFAULT FALSE AFTER emergency_flag,
    ADD COLUMN severe_dehydration BOOLEAN NOT NULL DEFAULT FALSE AFTER oedema,
    ADD COLUMN ai_summary VARCHAR(2000) NULL AFTER severe_dehydration;
