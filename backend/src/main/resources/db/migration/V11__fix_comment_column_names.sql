-- Fix column names to match entity (handle duplicates from ddl-auto)

-- If we have both old and new columns, drop the old ones
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'user_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'author_id') THEN
        ALTER TABLE ticket_comments DROP COLUMN user_id;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'body')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'content') THEN
        ALTER TABLE ticket_comments DROP COLUMN body;
    END IF;
END $$;

-- If only old columns exist, rename them
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'user_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'author_id') THEN
        ALTER TABLE ticket_comments RENAME COLUMN user_id TO author_id;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'body')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_comments' AND column_name = 'content') THEN
        ALTER TABLE ticket_comments RENAME COLUMN body TO content;
    END IF;
END $$;