-- =============================================================================
-- LUMINATE ECOSYSTEM - CAMEL CASE PROPERTY ALIGNMENT
-- Migration to ensure all database columns exist for camelCase DTO mapping
-- Database columns remain snake_case (PostgreSQL convention)
-- Application layer will handle camelCase <-> snake_case mapping
-- =============================================================================

-- Ensure username column exists and is unique
DO $$ 
BEGIN
    -- Add username column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(50);
    END IF;
END $$;

-- Create unique constraint on username if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name='users' AND constraint_name='users_username_unique') THEN
        -- First ensure all existing users have usernames
        UPDATE users SET username = 
          CASE 
            WHEN username IS NULL OR username = '' THEN
              -- Generate username from email prefix + random suffix
              REGEXP_REPLACE(
                LOWER(SPLIT_PART(email, '@', 1)) || '_' || SUBSTRING(id::text, 1, 8),
                '[^a-z0-9_]', '_', 'g'
              )
            ELSE username
          END
        WHERE username IS NULL OR username = '';
        
        -- Make username NOT NULL
        ALTER TABLE users ALTER COLUMN username SET NOT NULL;
        
        -- Add unique constraint
        ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
    END IF;
END $$;

-- Ensure all necessary columns exist in organizations table
DO $$ 
BEGIN
    -- contact_phone should already exist, but let's make sure
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='organizations' AND column_name='contact_phone') THEN
        ALTER TABLE organizations ADD COLUMN contact_phone VARCHAR(20);
    END IF;
    
    -- Ensure contact_email exists and is required
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='organizations' AND column_name='contact_email') THEN
        ALTER TABLE organizations ADD COLUMN contact_email CITEXT NOT NULL;
    END IF;
END $$;

-- Update any existing organizations with missing contact_email (use a default)
UPDATE organizations 
SET contact_email = COALESCE(contact_email, 'admin@' || LOWER(REPLACE(name, ' ', '')) || '.com')
WHERE contact_email IS NULL OR contact_email = '';

-- Create indexes for performance on commonly queried fields
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_contact_email ON organizations(contact_email);

-- =============================================================================
-- DATA VALIDATION AND CLEANUP
-- =============================================================================

-- Ensure all users have valid education levels
UPDATE users 
SET education_level = 'UNIVERSITY'::education_level
WHERE education_level IS NULL AND role IN ('INDIVIDUAL', 'ORG_WARD');

-- Ensure all organizations have industry types
UPDATE organizations 
SET industry_type = 'OTHER'::industry_type
WHERE industry_type IS NULL;

-- =============================================================================
-- COMMENTS FOR CAMELCASE MAPPING
-- =============================================================================

COMMENT ON COLUMN users.username IS 'Maps to camelCase: username';
COMMENT ON COLUMN users.email IS 'Maps to camelCase: email'; 
COMMENT ON COLUMN users.password_hash IS 'Maps to camelCase: passwordHash';
COMMENT ON COLUMN users.education_level IS 'Maps to camelCase: educationLevel';
COMMENT ON COLUMN users.organization_id IS 'Maps to camelCase: organizationId';
COMMENT ON COLUMN users.is_org_ward IS 'Maps to camelCase: isOrgWard';
COMMENT ON COLUMN users.is_active IS 'Maps to camelCase: isActive';
COMMENT ON COLUMN users.email_verified IS 'Maps to camelCase: emailVerified';
COMMENT ON COLUMN users.email_verified_at IS 'Maps to camelCase: emailVerifiedAt';
COMMENT ON COLUMN users.last_login_at IS 'Maps to camelCase: lastLoginAt';
COMMENT ON COLUMN users.created_at IS 'Maps to camelCase: createdAt';
COMMENT ON COLUMN users.updated_at IS 'Maps to camelCase: updatedAt';

COMMENT ON COLUMN organizations.contact_email IS 'Maps to camelCase: contactEmail';
COMMENT ON COLUMN organizations.contact_phone IS 'Maps to camelCase: contactPhone';
COMMENT ON COLUMN organizations.industry_type IS 'Maps to camelCase: industryType';
COMMENT ON COLUMN organizations.is_active IS 'Maps to camelCase: isActive';
COMMENT ON COLUMN organizations.admin_id IS 'Maps to camelCase: adminId';
COMMENT ON COLUMN organizations.created_at IS 'Maps to camelCase: createdAt';
COMMENT ON COLUMN organizations.updated_at IS 'Maps to camelCase: updatedAt';
