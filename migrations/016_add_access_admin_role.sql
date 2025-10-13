-- Migration: Add ACCESS_ADMIN role
-- Description: Adds ACCESS_ADMIN role with same privileges as SUPER_ADMIN
-- Date: 2025-10-12

-- Add ACCESS_ADMIN to user_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        WHERE t.typname = 'user_role' AND e.enumlabel = 'ACCESS_ADMIN'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'ACCESS_ADMIN';
    END IF;
END $$;

-- Add comment
COMMENT ON TYPE user_role IS 'User roles: SUPER_ADMIN, ACCESS_ADMIN (same privileges), ORG_ADMIN, ORG_WARD, INDIVIDUAL';
