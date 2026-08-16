-- V15: Reconcile nutrition_plans with the fields the application actually
-- uses (age_range, recommendations, foods_to_include, foods_to_avoid,
-- feeding_frequency, active). These were being written to by the entity but
-- had never landed in a migration, meaning the JPA entity and this table
-- disagreed on production databases and (depending on Hibernate settings)
-- either silently dropped data or failed schema validation on startup.
ALTER TABLE nutrition_plans
    ADD COLUMN IF NOT EXISTS age_range VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS recommendations VARCHAR(3000) NULL,
    ADD COLUMN IF NOT EXISTS foods_to_include VARCHAR(2000) NULL,
    ADD COLUMN IF NOT EXISTS foods_to_avoid VARCHAR(2000) NULL,
    ADD COLUMN IF NOT EXISTS feeding_frequency VARCHAR(200) NULL,
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- meal_name and description already existed (V1) but were unused by the
-- entity; description's length there was smaller than what recommendations
-- needs, so it's left as-is and the new recommendations column carries the
-- combined "title: description" style text going forward.
