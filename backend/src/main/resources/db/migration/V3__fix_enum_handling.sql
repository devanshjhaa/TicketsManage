-- Fix enum handling by using a function to cast VARCHAR to user_role

ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::text::user_role;
