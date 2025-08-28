-- Add is_organization_complete column to organizations table
ALTER TABLE organizations ADD COLUMN is_organization_complete BOOLEAN NOT NULL DEFAULT false;

-- Update existing organizations to have is_organization_complete set to true
UPDATE organizations SET is_organization_complete = true WHERE admin_id IS NOT NULL;
