-- =====================================================================
-- MtotoCare Africa — Production Seed Data
-- Version: 1.3 (July 2026)
--
-- Run AFTER schema.sql (or after V1-V13 Flyway migrations).
-- Contains ONLY the default admin account. No demo data.
--
-- Admin login (CHANGE THIS ON FIRST LOGIN):
--   email:    admin@mtotocare.africa
--   password: Admin123!
-- =====================================================================

USE mtotocare;

-- Detect which columns exist in `users` so the seed works on any
-- schema version.
SET @has_healthcare_provider := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'healthcare_provider'
);

-- Build the column list dynamically
SET @user_cols := CONCAT(
    'full_name, email, phone_number, password_hash, email_verified, phone_verified, preferred_language',
    IF(@has_healthcare_provider > 0, ', healthcare_provider', ''),
    ', active, created_at, updated_at'
);

SELECT CONCAT('Detected users columns: ', @user_cols) AS info;

-- =====================================================================
-- 1. ADMIN USER (only seeded user)
-- =====================================================================
SET @sql = CONCAT(
    "INSERT INTO users (", @user_cols, ") VALUES (",
    "'System Admin', 'admin@mtotocare.africa', '+255700000000', ",
    "'$2b$12$xgfFIEZM5.I18BbfQLfwEuxdG7vfsta.45Xpj7NErE0EJ7Rtg69vq', ",
    "TRUE, TRUE, 'en', ",
    IF(@has_healthcare_provider > 0, 'FALSE, ', ''),
    "TRUE, NOW(), NOW())"
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT 'Seeded admin user: admin@mtotocare.africa / Admin123!' AS info;
SELECT '!!! CHANGE THIS PASSWORD ON FIRST LOGIN !!!' AS warning;

-- =====================================================================
-- No demo data is seeded. The first parent to register through the
-- mobile app becomes the first user. Doctors and facilities are
-- created by the admin from the web admin portal.
-- =====================================================================
