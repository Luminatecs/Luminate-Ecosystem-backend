-- Migration: Update Temp Credentials with Correct Password Hash
-- Description: Update temp credentials with properly generated bcrypt hash
-- Date: 2025-10-12

-- Update all temp credentials with the correct bcrypt hash for TempPass123!
UPDATE temporary_credentials
SET temp_password = '$2b$12$GkXFvIZYA4/lxux1j0cDsu/PhypAQGJCWPIFAREqMj6bOHwGquw96',
    expires_at = NOW() + INTERVAL '5 days',
    is_used = false
WHERE temp_code IN (
    'lumtempcode-a1111111-0001-4001-8001-000000000001',
    'lumtempcode-a2222222-0002-4002-8002-000000000002',
    'lumtempcode-a3333333-0003-4003-8003-000000000003',
    'lumtempcode-a4444444-0004-4004-8004-000000000004',
    'lumtempcode-a5555555-0005-4005-8005-000000000005'
);

-- Confirmation
DO $$
BEGIN
    RAISE NOTICE 'Updated temp credentials with correct password hash';
    RAISE NOTICE 'Password: TempPass123!';
    RAISE NOTICE 'All 5 temp codes are now ready to use';
END $$;
