-- Migration to update education_level enum to match Ghana education system
-- This migration updates the education_level enum values to align with the Ghanaian education system

BEGIN;

-- Drop the dependent view temporarily
DROP VIEW IF EXISTS active_users;

-- Create a new temporary enum with the correct values
CREATE TYPE education_level_new AS ENUM (
    'JHS1',
    'JHS2', 
    'JHS3',
    'SHS1',
    'SHS2',
    'SHS3',
    'UNIVERSITY'
);

-- Add a temporary column with the new enum type
ALTER TABLE users ADD COLUMN education_level_temp education_level_new;

-- Map the old values to appropriate new values
UPDATE users SET education_level_temp = 
    CASE 
        WHEN education_level = 'HIGH_SCHOOL' THEN 'SHS3'::education_level_new
        WHEN education_level = 'UNDERGRADUATE' THEN 'UNIVERSITY'::education_level_new
        WHEN education_level = 'GRADUATE' THEN 'UNIVERSITY'::education_level_new
        WHEN education_level = 'POSTGRADUATE' THEN 'UNIVERSITY'::education_level_new
        WHEN education_level = 'DOCTORATE' THEN 'UNIVERSITY'::education_level_new
        WHEN education_level = 'CERTIFICATE' THEN 'SHS1'::education_level_new
        WHEN education_level = 'DIPLOMA' THEN 'SHS3'::education_level_new
        ELSE 'UNIVERSITY'::education_level_new
    END;

-- Drop the old column and enum
ALTER TABLE users DROP COLUMN education_level;
DROP TYPE education_level;

-- Rename the new enum and column
ALTER TYPE education_level_new RENAME TO education_level;
ALTER TABLE users RENAME COLUMN education_level_temp TO education_level;

-- Make the column NOT NULL if it was before
ALTER TABLE users ALTER COLUMN education_level SET NOT NULL;

-- Recreate the active_users view
CREATE VIEW active_users AS
SELECT * FROM users WHERE is_soft_deleted = FALSE;

COMMIT;
