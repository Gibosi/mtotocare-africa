-- V22: Align vaccinations with Vaccination JPA entity.
ALTER TABLE vaccinations
    ADD COLUMN IF NOT EXISTS vaccine_code VARCHAR(30),
    ADD COLUMN IF NOT EXISTS vaccine_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Backfill vaccine identity from the existing vaccination schedule.
UPDATE vaccinations v
SET vaccine_code = s.vaccine_code,
    vaccine_name = s.vaccine_name
FROM vaccination_schedule s
WHERE v.schedule_id = s.id
  AND (v.vaccine_code IS NULL OR v.vaccine_name IS NULL);

-- scheduled_date represents the planned date; existing next_dose_due is the
-- closest available value for legacy records.
UPDATE vaccinations
SET scheduled_date = next_dose_due
WHERE scheduled_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_vacc_child ON vaccinations(child_id);
CREATE INDEX IF NOT EXISTS idx_vacc_status ON vaccinations(status);
CREATE INDEX IF NOT EXISTS idx_vacc_due ON vaccinations(next_dose_due);

ALTER TABLE vaccinations ALTER COLUMN vaccine_code SET NOT NULL;
ALTER TABLE vaccinations ALTER COLUMN vaccine_name SET NOT NULL;
