-- Migration: 010 - Update ORG_ADMIN constraint for two-phase setup
-- Description: Modify the check constraint to allow ORG_ADMIN users to have NULL organization_id during setup phase
-- Date: 2025-08-24

BEGIN;

-- First, update existing data to comply with the new constraint logic
-- Set organization_setup_complete = false for ORG_ADMIN users with NULL organization_id
UPDATE users 
SET organization_setup_complete = false 
WHERE role = 'ORG_ADMIN' AND organization_id IS NULL;

-- Set organization_setup_complete = true for ORG_ADMIN users with organization_id
UPDATE users 
SET organization_setup_complete = true 
WHERE role = 'ORG_ADMIN' AND organization_id IS NOT NULL;

-- Drop the existing constraint that requires ORG_ADMIN users to always have organization_id
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_org_admin_has_org;

-- Add a new constraint that allows ORG_ADMIN users to have NULL organization_id during setup
-- They can have NULL organization_id if organization_setup_complete is false (during setup phase)
-- They must have organization_id if organization_setup_complete is true (after setup)
ALTER TABLE users ADD CONSTRAINT chk_org_admin_setup_logic CHECK (
    (role != 'ORG_ADMIN') OR 
    (role = 'ORG_ADMIN' AND organization_setup_complete = false AND organization_id IS NULL) OR
    (role = 'ORG_ADMIN' AND organization_setup_complete = true AND organization_id IS NOT NULL)
);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT chk_org_admin_setup_logic ON users IS 'ORG_ADMIN users can have NULL organization_id during setup phase (organization_setup_complete=false), but must have organization_id after setup completion (organization_setup_complete=true).';

COMMIT;
