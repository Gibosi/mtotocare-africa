-- ===================================================================
-- MtotoCare Africa - Development Milestones Table
-- Version: 1.1
-- Migration: V6__add_development_milestones.sql
-- Description: Tracks WHO-standard child development milestones
-- ===================================================================

CREATE TABLE development_milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    child_id BIGINT NOT NULL,
    category VARCHAR(30) NOT NULL,
    milestone_code VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    expected_age_months INT NOT NULL,
    expected_date DATE,
    achieved_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes VARCHAR(1000),
    photo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_devmile_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);
CREATE INDEX idx_devmilestone_child ON development_milestones(child_id);
CREATE INDEX idx_devmilestone_category ON development_milestones(category);
CREATE INDEX idx_devmilestone_age ON development_milestones(expected_age_months);
CREATE INDEX idx_devmilestone_status ON development_milestones(status);
