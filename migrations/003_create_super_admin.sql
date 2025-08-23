-- =============================================================================
-- LUMINATE ECOSYSTEM - SUPER ADMIN CREATION
-- Creates the initial super admin user for system bootstrap
-- =============================================================================

-- Note: This script is designed to be idempotent and can be run multiple times
-- The super admin will only be created if one doesn't already exist

DO $$
DECLARE
    super_admin_exists BOOLEAN;
    super_admin_id UUID := '99999999-9999-9999-9999-999999999999'::UUID;
BEGIN
    -- Check if super admin already exists
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE role = 'SUPER_ADMIN' AND email = 'superadmin@luminate-ecosystem.com'
    ) INTO super_admin_exists;

    IF NOT super_admin_exists THEN
        RAISE NOTICE 'Creating super admin user...';
        
        -- Create super admin user
        INSERT INTO users (
            id, 
            email, 
            password_hash, 
            name, 
            role, 
            is_active, 
            email_verified, 
            email_verified_at,
            created_at,
            updated_at
        ) VALUES (
            super_admin_id,
            'superadmin@luminate-ecosystem.com',
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m', -- password123
            'System Administrator',
            'SUPER_ADMIN',
            true,
            true,
            NOW(),
            NOW(),
            NOW()
        );

        -- Create admin details
        INSERT INTO admin_details (
            user_id,
            admin_type,
            permissions,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            super_admin_id,
            'SUPER_ADMIN',
            ARRAY[
                'MANAGE_USERS',
                'MANAGE_ORGANIZATIONS', 
                'SYSTEM_CONFIG',
                'VIEW_ANALYTICS',
                'MANAGE_TOKENS',
                'DELETE_USERS',
                'MANAGE_ROLES',
                'SYSTEM_MAINTENANCE'
            ],
            true,
            NOW(),
            NOW()
        );

        -- Create user profile
        INSERT INTO user_profiles (
            user_id,
            first_name,
            last_name,
            bio,
            created_at,
            updated_at
        ) VALUES (
            super_admin_id,
            'System',
            'Administrator',
            'System administrator responsible for platform management, user oversight, and system configuration. This is the primary administrative account for the Luminate Ecosystem.',
            NOW(),
            NOW()
        );

        -- Log the creation activity
        INSERT INTO user_activity_logs (
            user_id,
            activity_type,
            description,
            ip_address,
            user_agent,
            created_at
        ) VALUES (
            super_admin_id,
            'ACCOUNT_CREATION',
            'Super admin account created during system initialization',
            '127.0.0.1'::INET,
            'System/Database Migration',
            NOW()
        );

        RAISE NOTICE '=============================================================================';
        RAISE NOTICE 'SUPER ADMIN CREATED SUCCESSFULLY';
        RAISE NOTICE '=============================================================================';
        RAISE NOTICE 'Email: superadmin@luminate-ecosystem.com';
        RAISE NOTICE 'Password: password123';
        RAISE NOTICE 'Role: SUPER_ADMIN';
        RAISE NOTICE 'Status: Active & Email Verified';
        RAISE NOTICE '=============================================================================';
        RAISE NOTICE 'IMPORTANT: Change the default password after first login!';
        RAISE NOTICE '=============================================================================';
    ELSE
        RAISE NOTICE 'Super admin user already exists. Skipping creation.';
        
        -- Display existing super admin info
        RAISE NOTICE '=============================================================================';
        RAISE NOTICE 'EXISTING SUPER ADMIN INFORMATION';
        RAISE NOTICE '=============================================================================';
        
        -- Get and display existing super admin details using variables
        DECLARE
            admin_email TEXT;
            admin_name TEXT;
            admin_status TEXT;
            admin_verified TEXT;
            admin_created DATE;
        BEGIN
            SELECT 
                u.email,
                u.name,
                CASE WHEN u.is_active THEN 'Active' ELSE 'Inactive' END,
                CASE WHEN u.email_verified THEN 'Yes' ELSE 'No' END,
                u.created_at::DATE
            INTO admin_email, admin_name, admin_status, admin_verified, admin_created
            FROM users u 
            WHERE u.role = 'SUPER_ADMIN' AND u.email = 'superadmin@luminate-ecosystem.com'
            LIMIT 1;
            
            RAISE NOTICE 'Email: %', admin_email;
            RAISE NOTICE 'Name: %', admin_name;
            RAISE NOTICE 'Status: %', admin_status;
            RAISE NOTICE 'Email Verified: %', admin_verified;
            RAISE NOTICE 'Created: %', admin_created;
        END;
        
        RAISE NOTICE '=============================================================================';
    END IF;

    -- Verify admin details exist
    IF NOT EXISTS (SELECT 1 FROM admin_details WHERE user_id = super_admin_id) THEN
        RAISE NOTICE 'Creating missing admin details...';
        
        INSERT INTO admin_details (
            user_id,
            admin_type,
            permissions,
            is_active
        ) VALUES (
            super_admin_id,
            'SUPER_ADMIN',
            ARRAY[
                'MANAGE_USERS',
                'MANAGE_ORGANIZATIONS', 
                'SYSTEM_CONFIG',
                'VIEW_ANALYTICS',
                'MANAGE_TOKENS',
                'DELETE_USERS',
                'MANAGE_ROLES',
                'SYSTEM_MAINTENANCE'
            ],
            true
        );
    END IF;

    -- Verify user profile exists
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = super_admin_id) THEN
        RAISE NOTICE 'Creating missing user profile...';
        
        INSERT INTO user_profiles (
            user_id,
            first_name,
            last_name,
            bio
        ) VALUES (
            super_admin_id,
            'System',
            'Administrator',
            'System administrator responsible for platform management, user oversight, and system configuration. This is the primary administrative account for the Luminate Ecosystem.'
        );
    END IF;

END $$;
