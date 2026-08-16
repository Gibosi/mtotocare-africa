-- V17: Add credentials_verified to doctors.
ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS credentials_verified BOOLEAN NOT NULL DEFAULT FALSE;
