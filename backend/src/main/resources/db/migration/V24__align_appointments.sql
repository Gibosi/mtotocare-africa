-- V24: Align appointments with Appointment JPA entity.
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(200);
