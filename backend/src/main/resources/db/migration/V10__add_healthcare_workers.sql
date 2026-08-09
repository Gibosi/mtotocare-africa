-- ===================================================================
-- MtotoCare Africa - Healthcare Workers Table
-- Version: 1.1
-- Migration: V10__add_healthcare_workers.sql
-- Description: Doctors, nurses, midwives, community health workers directory
-- ===================================================================

CREATE TABLE healthcare_workers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    worker_role VARCHAR(30) NOT NULL,
    license_number VARCHAR(100),
    specialization VARCHAR(100),
    sub_specialty VARCHAR(100),
    qualifications VARCHAR(500),
    years_of_experience INT,
    languages_spoken VARCHAR(200) DEFAULT 'en',
    service_area VARCHAR(100),
    supervisor_id BIGINT,
    is_on_duty BOOLEAN NOT NULL DEFAULT TRUE,
    accepting_referrals BOOLEAN NOT NULL DEFAULT TRUE,
    facility_id BIGINT,
    bio VARCHAR(1000),
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_hw_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_hw_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE SET NULL
);
CREATE INDEX idx_hw_user ON healthcare_workers(user_id);
CREATE INDEX idx_hw_role ON healthcare_workers(worker_role);
CREATE INDEX idx_hw_service_area ON healthcare_workers(service_area, worker_role);
CREATE INDEX idx_hw_facility ON healthcare_workers(facility_id);
