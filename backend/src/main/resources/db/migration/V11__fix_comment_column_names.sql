-- Fix column names to match entity (idempotent)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'user_id') THEN
        ALTER TABLE ticket_comments RENAME COLUMN user_id TO author_id;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'body') THEN
        ALTER TABLE ticket_comments RENAME COLUMN body TO content;
    END IF;
END $$;