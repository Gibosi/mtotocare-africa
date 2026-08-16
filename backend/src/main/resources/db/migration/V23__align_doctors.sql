-- V23: Align doctors with Doctor JPA entity.
ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS sub_specialty VARCHAR(100),
    ADD COLUMN IF NOT EXISTS languages VARCHAR(200),
    ADD COLUMN IF NOT EXISTS primary_facility_id BIGINT;

-- The entity uses Double for consultationFee. Convert the legacy varchar
-- column only when its value is numeric; non-numeric legacy values become NULL.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='doctors'
          AND column_name='consultation_fee'
          AND data_type='character varying'
    ) THEN
        ALTER TABLE doctors
            ALTER COLUMN consultation_fee TYPE DOUBLE PRECISION
            USING CASE
                WHEN NULLIF(TRIM(consultation_fee), '') ~ '^[+-]?[0-9]+(\.[0-9]+)?$'
                THEN NULLIF(TRIM(consultation_fee), '')::DOUBLE PRECISION
                ELSE NULL
            END;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname='fk_doctor_primary_facility'
    ) THEN
        ALTER TABLE doctors
            ADD CONSTRAINT fk_doctor_primary_facility
            FOREIGN KEY (primary_facility_id) REFERENCES facilities(id) ON DELETE SET NULL;
    END IF;
END $$;
