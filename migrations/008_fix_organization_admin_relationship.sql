-- Migration: Fix Organization Admin Relationship and Add Setup Tracking
-- Purpose: Add organization setup completion tracking and proper foreign key constraints
-- Created: 2025-08-24

-- Add organization setup completion tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_setup_complete BOOLEAN DEFAULT false;

-- Add proper foreign key constraint for admin_id in organizations table
-- First, let's check if the constraint already exists and drop it if needed
DO $$
BEGIN
    -- Add the foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_organizations_admin_id'
        AND table_name = 'organizations'
    ) THEN
        ALTER TABLE organizations 
        ADD CONSTRAINT fk_organizations_admin_id 
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add index for better performance on organization lookup by admin
CREATE INDEX IF NOT EXISTS idx_organizations_admin_id ON organizations(admin_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_setup_complete ON users(organization_setup_complete);

-- Add comment for documentation
COMMENT ON COLUMN users.organization_setup_complete IS 'Tracks whether ORG_ADMIN users have completed their organization setup';
