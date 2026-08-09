-- V15: Reconcile nutrition_plans with the fields the application actually
-- uses (age_range, recommendations, foods_to_include, foods_to_avoid,
-- feeding_frequency, active). These were being written to by the entity but
-- had never landed in a migration, meaning the JPA entity and this table
-- disagreed on production databases and (depending on Hibernate settings)
-- either silently dropped data or failed schema validation on startup.
ALTER TABLE nutrition_plans
    ADD COLUMN age_range VARCHAR(50) NULL AFTER child_id,
    ADD COLUMN recommendations VARCHAR(3000) NULL AFTER meal_name,
    ADD COLUMN foods_to_include VARCHAR(2000) NULL AFTER recommendations,
    ADD COLUMN foods_to_avoid VARCHAR(2000) NULL AFTER foods_to_include,
    ADD COLUMN feeding_frequency VARCHAR(200) NULL AFTER foods_to_avoid,
    ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE AFTER notes;

-- meal_name and description already existed (V1) but were unused by the
-- entity; description's length there was smaller than what recommendations
-- needs, so it's left as-is and the new recommendations column carries the
-- combined "title: description" style text going forward.
