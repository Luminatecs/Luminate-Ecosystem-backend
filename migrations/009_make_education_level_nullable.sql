-- Migration: 009 - Make education_level nullable for ORG_ADMIN users
-- Description: Remove NOT NULL constraint from education_level column to allow ORG_ADMIN users without education level
-- Date: 2025-08-24

BEGIN;

-- Remove NOT NULL constraint from education_level column
ALTER TABLE users ALTER COLUMN education_level DROP NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN users.education_level IS 'Education level of the user. NULL allowed for ORG_ADMIN and SUPER_ADMIN users who do not need to specify their education level.';

COMMIT;
