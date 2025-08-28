-- Remove redundant is_organization_complete column since we're using organization_setup_complete in users table
ALTER TABLE organizations DROP COLUMN IF EXISTS is_organization_complete;
