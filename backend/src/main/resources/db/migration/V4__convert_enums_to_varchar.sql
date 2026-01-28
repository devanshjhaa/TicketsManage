-- Convert PostgreSQL enum columns to VARCHAR for better JPA compatibility

-- Convert users.role from enum to VARCHAR
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::text;

-- Convert tickets.status from enum to VARCHAR
ALTER TABLE tickets ALTER COLUMN status TYPE VARCHAR(50) USING status::text;

-- Convert tickets.priority from enum to VARCHAR
ALTER TABLE tickets ALTER COLUMN priority TYPE VARCHAR(50) USING priority::text;

-- Drop the enum types (optional, only if not used elsewhere)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;
