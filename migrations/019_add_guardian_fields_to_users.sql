-- Migration: Add guardian fields to users table
-- Description: Separate guardian contact info from ward (student) info
-- Date: 2025-11-09

-- Add guardian and ward specific columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS guardian_email CITEXT,
ADD COLUMN IF NOT EXISTS ward_name VARCHAR(100);

-- Update existing org wards: copy name to ward_name and guardian fields
-- For existing wards without guardian info, set placeholder values
UPDATE users
SET 
  ward_name = name,
  guardian_name = COALESCE(guardian_name, name || ' (Guardian)'),
  guardian_email = COALESCE(guardian_email, email)
WHERE is_org_ward = TRUE AND ward_name IS NULL;

-- Add constraint: NEW org wards must have guardian info
-- Using NOT VALIDATED to allow existing data, then validate after cleanup
ALTER TABLE users
ADD CONSTRAINT chk_org_ward_has_guardian CHECK (
    (is_org_ward = FALSE) OR 
    (is_org_ward = TRUE AND guardian_name IS NOT NULL AND guardian_email IS NOT NULL AND ward_name IS NOT NULL)
) NOT VALID;

-- Validate the constraint now that data is fixed
ALTER TABLE users VALIDATE CONSTRAINT chk_org_ward_has_guardian;

-- Add indexes for guardian email lookups
CREATE INDEX IF NOT EXISTS idx_users_guardian_email ON users(guardian_email) WHERE guardian_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_ward_name ON users(ward_name) WHERE ward_name IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN users.guardian_name IS 'Name of parent/guardian (for ORG_WARD users only)';
COMMENT ON COLUMN users.guardian_email IS 'Email of parent/guardian where temp credentials are sent (for ORG_WARD users only)';
COMMENT ON COLUMN users.ward_name IS 'Actual student name (for ORG_WARD users only)';

