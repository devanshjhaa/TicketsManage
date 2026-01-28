-- Add password field for email/password authentication

ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
