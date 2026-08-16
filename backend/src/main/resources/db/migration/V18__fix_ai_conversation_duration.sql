-- V18: Align ai_conversations response duration column
-- Hibernate entity expects duration_ms.
-- V1 originally created response_time_ms.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'ai_conversations'
          AND column_name = 'response_time_ms'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'ai_conversations'
          AND column_name = 'duration_ms'
    ) THEN

ALTER TABLE ai_conversations
    RENAME COLUMN response_time_ms TO duration_ms;

ELSIF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'ai_conversations'
          AND column_name = 'duration_ms'
    ) THEN

ALTER TABLE ai_conversations
    ADD COLUMN duration_ms BIGINT;

END IF;
END $$;