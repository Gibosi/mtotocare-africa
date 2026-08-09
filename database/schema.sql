-- =====================================================================
-- MtotoCare Africa — Production MySQL Database Schema
-- Version: 1.1 (synced with backend Java entities — July 2026)
--
-- This file is the production reference schema. For dev (H2 in-memory)
-- the JPA entities auto-create tables on startup.
-- =====================================================================

-- Drop database if exists
DROP DATABASE IF EXISTS mtotocare;
CREATE DATABASE mtotocare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mtotocare;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. USERS
-- =====================================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    profile_picture_url VARCHAR(500),
    preferred_language VARCHAR(10) DEFAULT 'en',
    healthcare_provider BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_user_email (email),
    INDEX idx_user_phone (phone_number),
    INDEX idx_user_active (active, deleted_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 2. USER ROLES (Many-to-Many)
-- =====================================================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =====================================================================
-- 3. FACILITIES
-- =====================================================================
CREATE TABLE facilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(50) NOT NULL,
    address VARCHAR(500),
    region VARCHAR(100),
    district VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(150),
    latitude DOUBLE,
    longitude DOUBLE,
    operating_hours VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_facility_region (region),
    INDEX idx_facility_type (facility_type),
    INDEX idx_facility_active (active, deleted_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 4. DOCTORS (Healthcare workers)
-- =====================================================================
CREATE TABLE doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    specialization VARCHAR(100),
    sub_specialty VARCHAR(100),
    qualifications VARCHAR(500),
    languages VARCHAR(200),
    years_of_experience INT,
    bio VARCHAR(1000),
    accepting_new_patients BOOLEAN NOT NULL DEFAULT TRUE,
    primary_facility_id BIGINT,
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_facility FOREIGN KEY (primary_facility_id) REFERENCES facilities(id) ON DELETE SET NULL,
    INDEX idx_doctor_user (user_id),
    INDEX idx_doctor_specialization (specialization),
    INDEX idx_doctor_facility (primary_facility_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 5. DOCTOR LANGUAGES (Many-to-Many)
-- =====================================================================
CREATE TABLE doctor_languages (
    doctor_id BIGINT NOT NULL,
    language VARCHAR(10) NOT NULL,
    PRIMARY KEY (doctor_id, language),
    CONSTRAINT fk_doc_lang_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 6. HEALTHCARE WORKERS (broader than doctors — includes nurses, CHWs)
-- =====================================================================
CREATE TABLE healthcare_workers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    worker_role VARCHAR(50) NOT NULL,
    service_area VARCHAR(200),
    sub_specialty VARCHAR(100),
    is_on_duty BOOLEAN NOT NULL DEFAULT FALSE,
    accepting_referrals BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_hw_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_hw_user (user_id),
    INDEX idx_hw_role (worker_role)
) ENGINE=InnoDB;

-- =====================================================================
-- 7. CHILDREN
-- =====================================================================
CREATE TABLE children (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    blood_group VARCHAR(5),
    birth_weight_kg DECIMAL(5,2),
    birth_height_cm DECIMAL(5,2),
    profile_picture_url VARCHAR(500),
    national_id VARCHAR(50),
    parent_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_child_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_child_parent (parent_id),
    INDEX idx_child_dob (date_of_birth),
    INDEX idx_child_active (deleted_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 8. APPOINTMENTS
-- =====================================================================
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    doctor_id BIGINT,
    appointment_datetime TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 30,
    appointment_type VARCHAR(100),
    clinic_name VARCHAR(200),
    clinic_address VARCHAR(500),
    doctor_name VARCHAR(200),
    reason VARCHAR(1000),
    notes VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    cancellation_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_appt_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    INDEX idx_appt_child (child_id),
    INDEX idx_appt_doctor (doctor_id),
    INDEX idx_appt_datetime (appointment_datetime),
    INDEX idx_appt_status (status),
    INDEX idx_appt_child_datetime (child_id, appointment_datetime)
) ENGINE=InnoDB;

-- =====================================================================
-- 9. VACCINATION SCHEDULE (Tanzania EPI)
-- =====================================================================
CREATE TABLE vaccination_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vaccine_code VARCHAR(30) NOT NULL UNIQUE,
    vaccine_name VARCHAR(150) NOT NULL,
    description TEXT,
    recommended_age_weeks INT NOT NULL,
    doses_required INT NOT NULL DEFAULT 1,
    dose_number INT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO vaccination_schedule
    (vaccine_code, vaccine_name, description, recommended_age_weeks, doses_required, dose_number)
VALUES
    ('BCG',    'BCG (Bacillus Calmette-Guérin)',     'Tuberculosis vaccine',                                  0,  1, 1),
    ('OPV0',   'Oral Polio Vaccine 0',                'Poliomyelitis prevention - birth dose',                 0,  4, 1),
    ('OPV1',   'Oral Polio Vaccine 1',                'Poliomyelitis prevention',                              6,  4, 2),
    ('OPV2',   'Oral Polio Vaccine 2',                'Poliomyelitis prevention',                             10,  4, 3),
    ('OPV3',   'Oral Polio Vaccine 3',                'Poliomyelitis prevention',                             14,  4, 4),
    ('PENTA1', 'Pentavalent 1',                       'DPT-HepB-Hib vaccine',                                 6,  3, 1),
    ('PENTA2', 'Pentavalent 2',                       'DPT-HepB-Hib vaccine',                                10,  3, 2),
    ('PENTA3', 'Pentavalent 3',                       'DPT-HepB-Hib vaccine',                                14,  3, 3),
    ('PCV1',   'Pneumococcal Conjugate 1',            'Pneumococcal disease prevention',                       6,  3, 1),
    ('PCV2',   'Pneumococcal Conjugate 2',            'Pneumococcal disease prevention',                      10,  3, 2),
    ('PCV3',   'Pneumococcal Conjugate 3',            'Pneumococcal disease prevention',                      14,  3, 3),
    ('ROTA1',  'Rotavirus 1',                         'Rotavirus diarrhea prevention',                         6,  2, 1),
    ('ROTA2',  'Rotavirus 2',                         'Rotavirus diarrhea prevention',                        10,  2, 2),
    ('MV1',    'Measles 1',                           'Measles vaccine - first dose',                         39, 2, 1),
    ('MV2',    'Measles 2',                           'Measles vaccine - second dose',                        65, 2, 2),
    ('YF',     'Yellow Fever',                        'Yellow fever vaccine',                                 39, 1, 1),
    ('VIT_A',  'Vitamin A Supplementation',           'Vitamin A dose',                                       26, 1, 1);

-- =====================================================================
-- 10. VACCINATIONS (administered + planned per child)
-- =====================================================================
CREATE TABLE vaccinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    schedule_id BIGINT NOT NULL,
    vaccine_code VARCHAR(30) NOT NULL,
    vaccine_name VARCHAR(150) NOT NULL,
    dose_number INT NOT NULL DEFAULT 1,
    scheduled_date DATE,
    administered_at DATE,
    next_dose_due DATE,
    administered_by VARCHAR(150),
    clinic_name VARCHAR(200),
    batch_number VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING / COMPLETED / OVERDUE / SKIPPED
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_vacc_child    FOREIGN KEY (child_id)    REFERENCES children(id) ON DELETE CASCADE,
    CONSTRAINT fk_vacc_schedule FOREIGN KEY (schedule_id) REFERENCES vaccination_schedule(id),
    INDEX idx_vacc_child (child_id),
    INDEX idx_vacc_status (status),
    INDEX idx_vacc_due (next_dose_due),
    INDEX idx_vacc_child_status_due (child_id, status, next_dose_due)
) ENGINE=InnoDB;

-- =====================================================================
-- 11. GROWTH RECORDS
-- =====================================================================
-- Column names here match the actual Flyway-managed schema (V1 + V16),
-- not the earlier draft of this doc — V1 used the "_z_score" suffix
-- (weight_for_age_z_score, etc.), which is what the JPA entity binds to.
CREATE TABLE growth_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    measurement_date DATE NOT NULL,
    age_in_days INT, -- exact age at measurement, used for WHO Z-score lookups
    weight_kg DECIMAL(5,2) NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL,
    head_circumference_cm DECIMAL(5,2),
    muac_cm DECIMAL(4,1), -- Mid-Upper Arm Circumference
    bmi DECIMAL(4,1),
    weight_for_age_z_score DECIMAL(4,2),   -- WAZ
    height_for_age_z_score DECIMAL(4,2),   -- HAZ
    weight_for_height_z_score DECIMAL(4,2),-- WHZ
    bmi_for_age_z_score DECIMAL(4,2),      -- BAZ
    nutrition_status VARCHAR(50),          -- overall WHO classification (e.g. STUNTED, SEVERELY_WASTED, NORMAL)
    risk_level VARCHAR(20),                -- LOW / MODERATE / HIGH / CRITICAL (app-level triage heuristic)
    health_score INT,                      -- 0-100 composite (app-level heuristic)
    growth_trend VARCHAR(20),              -- IMPROVING / STABLE / FALTERING (vs. previous record)
    referral_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_flag BOOLEAN NOT NULL DEFAULT FALSE,
    oedema BOOLEAN NOT NULL DEFAULT FALSE,           -- clinician-reported
    severe_dehydration BOOLEAN NOT NULL DEFAULT FALSE, -- clinician-reported
    ai_summary VARCHAR(2000),              -- AI-generated plain-language clinical summary
    notes TEXT,
    recorded_by VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_growth_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    INDEX idx_growth_child (child_id),
    INDEX idx_growth_date (measurement_date)
) ENGINE=InnoDB;

-- =====================================================================
-- 12. NUTRITION PLANS
-- =====================================================================
CREATE TABLE nutrition_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    age_range VARCHAR(50),
    recommendations VARCHAR(3000),
    foods_to_include VARCHAR(2000),
    foods_to_avoid VARCHAR(2000),
    feeding_frequency VARCHAR(200),
    plan_date DATE,
    meal_type VARCHAR(50),         -- BREAKFAST / LUNCH / DINNER / SNACK
    meal_name VARCHAR(200),
    description VARCHAR(1000),
    ingredients VARCHAR(500),
    calories_kcal INT,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    notes VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_nutrition_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    INDEX idx_nutrition_child (child_id),
    INDEX idx_nutrition_date (plan_date)
) ENGINE=InnoDB;

-- =====================================================================
-- 13. MEDICATIONS
-- =====================================================================
CREATE TABLE medications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    prescribed_by VARCHAR(150),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_med_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    INDEX idx_med_child (child_id),
    INDEX idx_med_active (active)
) ENGINE=InnoDB;

-- =====================================================================
-- 14. ALLERGIES
-- =====================================================================
CREATE TABLE allergies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    allergen VARCHAR(200) NOT NULL,
    reaction VARCHAR(500),
    severity VARCHAR(20), -- MILD / MODERATE / SEVERE / CRITICAL
    diagnosed_at DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_allergy_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    INDEX idx_allergy_child (child_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 15. DIAGNOSES
-- =====================================================================
CREATE TABLE diagnoses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    doctor_id BIGINT,
    doctor_name VARCHAR(200),
    condition VARCHAR(500) NOT NULL,
    diagnosis_code VARCHAR(50),
    severity VARCHAR(20), -- MILD / MODERATE / SEVERE
    diagnosed_at DATE NOT NULL,
    treatment_plan TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_diag_child  FOREIGN KEY (child_id)  REFERENCES children(id) ON DELETE CASCADE,
    CONSTRAINT fk_diag_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    INDEX idx_diag_child (child_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 16. HEALTH RECORDS (general)
-- =====================================================================
CREATE TABLE health_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    record_type VARCHAR(50) NOT NULL, -- VISIT, DIAGNOSIS, ALLERGY, MEDICATION, LAB_RESULT
    title VARCHAR(200) NOT NULL,
    description TEXT,
    record_date DATE NOT NULL,
    doctor_name VARCHAR(200),
    clinic_name VARCHAR(200),
    document_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_health_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    INDEX idx_health_child (child_id),
    INDEX idx_health_type (record_type)
) ENGINE=InnoDB;

-- =====================================================================
-- 17. NOTIFICATIONS
-- =====================================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL, -- VACCINATION, GROWTH_CHECK, APPOINTMENT, MEDICATION, GENERAL
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    action_url VARCHAR(500),
    metadata TEXT,
    read_flag BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP NULL,
    channel VARCHAR(20), -- PUSH, SMS, EMAIL, IN_APP
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED, READ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_status (status),
    INDEX idx_notif_scheduled (scheduled_for)
) ENGINE=InnoDB;

-- =====================================================================
-- 18. AUDIT LOGS
-- =====================================================================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(150),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (created_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 19. AUTH SESSIONS (refresh tokens)
-- =====================================================================
CREATE TABLE auth_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    device_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_user (user_id),
    INDEX idx_session_token (refresh_token)
) ENGINE=InnoDB;

-- =====================================================================
-- 20. PASSWORD RESET TOKENS
-- =====================================================================
CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pwreset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pwreset_token (token),
    INDEX idx_pwreset_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 21. DEVICES (push notification tokens)
-- =====================================================================
CREATE TABLE devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    platform VARCHAR(20), -- ANDROID / IOS / WEB
    push_token VARCHAR(500),
    app_version VARCHAR(20),
    last_active_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_device (user_id, device_id),
    CONSTRAINT fk_device_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_device_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 22. SYNC LOGS (offline-first)
-- =====================================================================
CREATE TABLE sync_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(100),
    client_id VARCHAR(100),
    operation VARCHAR(20) NOT NULL, -- UPLOAD / DOWNLOAD / PUSH / PULL
    entity_type VARCHAR(50),
    entity_id BIGINT,
    records_uploaded INT DEFAULT 0,
    records_downloaded INT DEFAULT 0,
    conflicts_resolved INT DEFAULT 0,
    synced_at TIMESTAMP NOT NULL,
    client_timestamp TIMESTAMP NULL,
    ip_address VARCHAR(45),
    app_version VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_sync_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sync_user (user_id),
    INDEX idx_sync_entity (entity_type, entity_id),
    INDEX idx_sync_time (synced_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 23. FILE UPLOADS
-- =====================================================================
CREATE TABLE file_uploads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    child_id BIGINT,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50), -- IMAGE / PDF / DOC
    file_size BIGINT,
    storage_url VARCHAR(500) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_file_user  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_file_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL,
    INDEX idx_file_user (user_id),
    INDEX idx_file_child (child_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 24. AI CONVERSATIONS
-- =====================================================================
CREATE TABLE ai_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    child_id BIGINT,
    role VARCHAR(20) NOT NULL, -- user / assistant
    content TEXT NOT NULL,
    language VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_user  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL,
    INDEX idx_ai_user (user_id),
    INDEX idx_ai_child (child_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 25. EMERGENCY CONTACTS
-- =====================================================================
CREATE TABLE emergency_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50),
    phone_number VARCHAR(20) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emergency_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_emergency_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 26. PREGNANCY / ANC RECORDS
-- =====================================================================
CREATE TABLE pregnancies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    last_menstrual_period DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    gravida INT,
    para INT,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_preg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_preg_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE anc_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pregnancy_id BIGINT NOT NULL,
    visit_date DATE NOT NULL,
    gestational_age_weeks INT,
    weight_kg DECIMAL(5,2),
    blood_pressure VARCHAR(20),
    fundal_height_cm DECIMAL(4,1),
    fetal_heart_rate INT,
    notes TEXT,
    next_visit_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_anc_preg FOREIGN KEY (pregnancy_id) REFERENCES pregnancies(id) ON DELETE CASCADE,
    INDEX idx_anc_preg (pregnancy_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 27. DEVELOPMENT MILESTONES
-- =====================================================================
CREATE TABLE development_milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    milestone_code VARCHAR(50) NOT NULL,
    milestone_name VARCHAR(200) NOT NULL,
    expected_age_months INT NOT NULL,
    achieved_at DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_milestone_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    INDEX idx_milestone_child (child_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 28. CONSENTS
-- =====================================================================
CREATE TABLE consents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    child_id BIGINT,
    consent_type VARCHAR(50) NOT NULL, -- DATA_PROCESSING / NOTIFICATIONS / RESEARCH
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at TIMESTAMP,
    expires_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consent_user  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_consent_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL,
    INDEX idx_consent_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 29. SETTINGS (per-user app settings)
-- =====================================================================
CREATE TABLE user_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light', -- light / dark
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'MtotoCare Africa database schema v1.1 created successfully!' AS status;
