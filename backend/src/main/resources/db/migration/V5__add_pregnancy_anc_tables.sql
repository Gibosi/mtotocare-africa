-- ===================================================================
-- MtotoCare Africa - Pregnancy & ANC/PNC Tables
-- Version: 1.1
-- Migration: V5__add_pregnancy_anc_tables.sql
-- Description: Adds pregnancy tracking and antenatal/postnatal care visits
-- ===================================================================

-- ===================
-- PREGNANCIES
-- ===================
CREATE TABLE pregnancies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mother_id BIGINT NOT NULL,
    last_menstrual_period DATE NOT NULL,
    expected_due_date DATE NOT NULL,
    conception_date DATE,
    gravida INT,
    para INT,
    miscarriages INT,
    blood_group VARCHAR(5),
    rh_factor VARCHAR(10),
    weight_kg_pre_pregnancy DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    high_risk BOOLEAN NOT NULL DEFAULT FALSE,
    risk_factors VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    delivery_date DATE,
    delivery_type VARCHAR(30),
    delivery_outcome VARCHAR(30),
    baby_gender VARCHAR(10),
    baby_weight_kg DECIMAL(5,2),
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_preg_mother FOREIGN KEY (mother_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_preg_mother ON pregnancies(mother_id);
CREATE INDEX idx_preg_status ON pregnancies(status);

-- ===================
-- ANC / PNC VISITS
-- ===================
CREATE TABLE anc_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pregnancy_id BIGINT NOT NULL,
    visit_type VARCHAR(20) NOT NULL,
    visit_number INT NOT NULL,
    visit_date DATE NOT NULL,
    next_visit_date DATE,
    gestational_weeks INT,
    weight_kg DECIMAL(5,2),
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    hemoglobin_g_dl DECIMAL(4,2),
    fundal_height_cm DECIMAL(5,2),
    fetal_heart_rate INT,
    fetal_movement VARCHAR(20),
    edema BOOLEAN NOT NULL DEFAULT FALSE,
    proteinuria BOOLEAN NOT NULL DEFAULT FALSE,
    urine_glucose VARCHAR(20),
    iron_folic_given BOOLEAN NOT NULL DEFAULT FALSE,
    tt_vaccine_given BOOLEAN NOT NULL DEFAULT FALSE,
    ipt_given BOOLEAN NOT NULL DEFAULT FALSE,
    deworming_given BOOLEAN NOT NULL DEFAULT FALSE,
    hiv_test_done BOOLEAN NOT NULL DEFAULT FALSE,
    hiv_result VARCHAR(20),
    syphilis_test_done BOOLEAN NOT NULL DEFAULT FALSE,
    syphilis_result VARCHAR(20),
    ultrasound_done BOOLEAN NOT NULL DEFAULT FALSE,
    ultrasound_findings VARCHAR(1000),
    complications VARCHAR(1000),
    referred BOOLEAN NOT NULL DEFAULT FALSE,
    referral_reason VARCHAR(500),
    health_facility VARCHAR(200),
    attended_by VARCHAR(200),
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_anc_pregnancy FOREIGN KEY (pregnancy_id) REFERENCES pregnancies(id) ON DELETE CASCADE
);
CREATE INDEX idx_anc_pregnancy ON anc_visits(pregnancy_id);
CREATE INDEX idx_anc_date ON anc_visits(visit_date);
CREATE INDEX idx_anc_type ON anc_visits(visit_type);
