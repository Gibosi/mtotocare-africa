-- V15: Align nutrition_plans with NutritionPlan JPA entity.
ALTER TABLE nutrition_plans
    ADD COLUMN IF NOT EXISTS age_range VARCHAR(50),
    ADD COLUMN IF NOT EXISTS recommendations VARCHAR(3000),
    ADD COLUMN IF NOT EXISTS foods_to_include VARCHAR(2000),
    ADD COLUMN IF NOT EXISTS foods_to_avoid VARCHAR(2000),
    ADD COLUMN IF NOT EXISTS feeding_frequency VARCHAR(200),
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
