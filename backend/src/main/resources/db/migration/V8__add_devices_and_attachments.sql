-- ===================================================================
-- MtotoCare Africa - Devices and Attachments Tables
-- Version: 1.1
-- Migration: V8__add_devices_and_attachments.sql
-- Description: Multi-device tracking, push notifications, and file uploads
-- ===================================================================

-- ===================
-- DEVICES (push tokens, biometric)
-- ===================
CREATE TABLE devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(200) NOT NULL,
    push_token VARCHAR(500),
    platform VARCHAR(20) NOT NULL,
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    device_model VARCHAR(100),
    manufacturer VARCHAR(100),
    locale VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Dar_es_Salaam',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_active_at TIMESTAMP NULL,
    biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_device_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_device_user ON devices(user_id);
CREATE INDEX idx_device_token ON devices(push_token);

-- ===================
-- ATTACHMENTS (file uploads)
-- ===================
CREATE TABLE attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    child_id BIGINT,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    content_type VARCHAR(100),
    file_size_bytes BIGINT,
    storage_path VARCHAR(1000) NOT NULL,
    storage_provider VARCHAR(20) DEFAULT 'LOCAL',
    public_url VARCHAR(1000),
    attachment_type VARCHAR(30),
    category VARCHAR(50),
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_attach_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attach_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);
CREATE INDEX idx_attach_user ON attachments(user_id);
CREATE INDEX idx_attach_child ON attachments(child_id);
CREATE INDEX idx_attach_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attach_category ON attachments(category);
