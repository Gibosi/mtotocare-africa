-- V17: Add credentials_verified to doctors — tracks whether an admin has
-- confirmed a healthcare worker's medical license against the licensing
-- body. Defaults false for all existing rows; an admin explicitly marks
-- each doctor verified via PUT /admin/doctors/{id}/verify.
ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS credentials_verified BOOLEAN NOT NULL DEFAULT FALSE;
