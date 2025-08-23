-- =============================================================================
-- LUMINATE ECOSYSTEM - ADD USERNAME COLUMN
-- Adds username column to users table and updates authentication logic
-- =============================================================================

-- Add username column to users table (initially nullable)
ALTER TABLE users 
ADD COLUMN username VARCHAR(50);

-- Update existing users with unique usernames using proper format
UPDATE users SET username = 
  CASE 
    WHEN email = 'superadmin@luminate-ecosystem.com' THEN 'superadmin'
    WHEN email = 'admin@git.edu.gh' THEN 'git_admin'
    WHEN email = 'admin@ashesi.edu.gh' THEN 'ashesi_admin'
    WHEN email = 'admin@atu.edu.gh' THEN 'atu_admin'
    WHEN email = 'admin@kbth.gov.gh' THEN 'kbth_admin'
    WHEN email = 'admin@ghanatechsolutions.com' THEN 'gts_admin'
    WHEN email = 'john.mensah@gmail.com' THEN 'john_mensah'
    WHEN email = 'afia.osei@yahoo.com' THEN 'afia_osei'
    WHEN email = 'kofi.asante@hotmail.com' THEN 'kofi_asante'
    WHEN email = 'student1@git.edu.gh' THEN 'michael_boateng'
    WHEN email = 'student2@git.edu.gh' THEN 'ama_gyasi'
    WHEN email = 'student1@ashesi.edu.gh' THEN 'kwabena_owusu'
    WHEN email = 'student2@ashesi.edu.gh' THEN 'efua_ansah'
    WHEN email = 'student1@atu.edu.gh' THEN 'yaw_appiah'
    ELSE 
      -- For any other users, create username from email prefix + ID suffix
      REGEXP_REPLACE(
        LOWER(SPLIT_PART(email, '@', 1)) || '_' || SUBSTRING(id::text, 1, 8),
        '[^a-z0-9_-]', '_', 'g'
      )
  END;

-- Now add the unique constraint and not null constraint
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Create index for username lookups
CREATE INDEX idx_users_username ON users(username);

-- Add constraint to ensure username format (alphanumeric, underscores, hyphens only)
ALTER TABLE users ADD CONSTRAINT chk_username_format 
CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$');

-- =============================================================================
-- SUMMARY
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'USERNAME COLUMN MIGRATION COMPLETED';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Added username column to users table';
    RAISE NOTICE 'Created unique constraint and format validation';
    RAISE NOTICE 'Updated all existing users with proper usernames';
    RAISE NOTICE 'Created index for efficient username lookups';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Authentication will now use USERNAME instead of EMAIL';
    RAISE NOTICE 'Username format: 3-50 characters, alphanumeric, underscore, hyphen only';
    RAISE NOTICE '=============================================================================';
END $$;
