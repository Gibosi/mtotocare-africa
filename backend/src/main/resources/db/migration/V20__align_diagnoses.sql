-- V20: Align diagnoses with Diagnosis JPA entity while preserving old data.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='diagnoses' AND column_name='diagnosis_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='diagnoses' AND column_name='condition_name') THEN
        ALTER TABLE diagnoses RENAME COLUMN diagnosis_name TO condition_name;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='diagnoses' AND column_name='icd10_code')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='diagnoses' AND column_name='diagnosis_code') THEN
        ALTER TABLE diagnoses RENAME COLUMN icd10_code TO diagnosis_code;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='diagnoses' AND column_name='diagnosis_date')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='diagnoses' AND column_name='diagnosed_at') THEN
        ALTER TABLE diagnoses RENAME COLUMN diagnosis_date TO diagnosed_at;
    END IF;
END $$;

ALTER TABLE diagnoses
    ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS treatment_plan VARCHAR(2000);

CREATE INDEX IF NOT EXISTS idx_diag_child ON diagnoses(child_id);
