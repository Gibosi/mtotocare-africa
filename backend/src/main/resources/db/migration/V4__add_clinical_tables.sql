-- ===================================================================
-- MtotoCare Africa - Clinical Tables
-- Version: 1.0
-- Migration: V4__add_clinical_tables.sql
-- Description: Adds diagnosis, medication, prescription, allergy tables
-- ===================================================================

-- ===================
-- DIAGNOSES
-- ===================
CREATE TABLE diagnoses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    doctor_id BIGINT,
    icd10_code VARCHAR(20) NOT NULL,
    diagnosis_name VARCHAR(300) NOT NULL,
    notes VARCHAR(2000),
    diagnosis_date DATE NOT NULL,
    severity VARCHAR(50),
    status VARCHAR(50),
    resolved_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_diag_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    CONSTRAINT fk_diag_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_diag_child ON diagnoses(child_id);
CREATE INDEX idx_diag_date ON diagnoses(diagnosis_date);
CREATE INDEX idx_diag_status ON diagnoses(status);

-- ===================
-- MEDICATIONS
-- ===================
CREATE TABLE medications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    reason VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    notes VARCHAR(1000),
    prescribed_by VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_med_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);
CREATE INDEX idx_med_child ON medications(child_id);
CREATE INDEX idx_med_status ON medications(status);

-- ===================
-- PRESCRIPTIONS
-- ===================
CREATE TABLE prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    prescription_number VARCHAR(30) NOT NULL UNIQUE,
    issued_date DATE NOT NULL,
    valid_until DATE,
    general_instructions VARCHAR(2000),
    signature_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_rx_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    CONSTRAINT fk_rx_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX idx_rx_child ON prescriptions(child_id);
CREATE INDEX idx_rx_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_rx_number ON prescriptions(prescription_number);

-- ===================
-- PRESCRIPTION ITEMS
-- ===================
CREATE TABLE prescription_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prescription_id BIGINT NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration_days INT,
    instructions VARCHAR(1000),
    CONSTRAINT fk_rx_items_rx FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);
CREATE INDEX idx_rx_items_rx ON prescription_items(prescription_id);

-- ===================
-- ALLERGIES
-- ===================
CREATE TABLE allergies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    allergen VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(50),
    reaction VARCHAR(1000),
    management VARCHAR(1000),
    diagnosed_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_allergy_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);
CREATE INDEX idx_allergy_child ON allergies(child_id);
CREATE INDEX idx_allergy_severity ON allergies(severity);

-- ===================================================================
-- END OF V4__add_clinical_tables.sql
-- ===================================================================
