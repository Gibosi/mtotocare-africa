-- V19: Align allergies with Allergy JPA entity.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='allergies'
          AND column_name='diagnosed_date'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='allergies'
          AND column_name='diagnosed_at'
    ) THEN
        ALTER TABLE allergies RENAME COLUMN diagnosed_date TO diagnosed_at;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='allergies'
          AND column_name='diagnosed_at'
    ) THEN
        ALTER TABLE allergies ADD COLUMN diagnosed_at DATE;
    END IF;
END $$;

ALTER TABLE allergies
    ADD COLUMN IF NOT EXISTS notes VARCHAR(1000);

CREATE INDEX IF NOT EXISTS idx_allergy_child ON allergies(child_id);
CREATE INDEX IF NOT EXISTS idx_allergy_severity ON allergies(severity);
