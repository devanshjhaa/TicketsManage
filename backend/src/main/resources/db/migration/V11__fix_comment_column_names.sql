-- Fix column names to match entity
ALTER TABLE ticket_comments RENAME COLUMN user_id TO author_id;
ALTER TABLE ticket_comments RENAME COLUMN body TO content;