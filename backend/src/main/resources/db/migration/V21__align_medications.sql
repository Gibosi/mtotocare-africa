-- V21: Align medications with Medication JPA entity.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='medications' AND column_name='medication_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='medications' AND column_name='name') THEN
        ALTER TABLE medications RENAME COLUMN medication_name TO name;
    END IF;
END $$;

ALTER TABLE medications
    ADD COLUMN IF NOT EXISTS prescriber_id BIGINT,
    ADD COLUMN IF NOT EXISTS active BOOLEAN;

UPDATE medications
SET active = CASE
    WHEN UPPER(COALESCE(status, 'ACTIVE')) IN ('ACTIVE','CURRENT','ONGOING') THEN TRUE
    ELSE FALSE
END
WHERE active IS NULL;

ALTER TABLE medications
    ALTER COLUMN active SET DEFAULT TRUE;
ALTER TABLE medications
    ALTER COLUMN active SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_med_child ON medications(child_id);
CREATE INDEX IF NOT EXISTS idx_med_active ON medications(active);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname='fk_med_prescriber'
    ) THEN
        ALTER TABLE medications
            ADD CONSTRAINT fk_med_prescriber
            FOREIGN KEY (prescriber_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;
