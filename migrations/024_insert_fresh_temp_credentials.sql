-- Migration: Insert Fresh Temp Credentials with Correct Hash
-- Description: Insert 5 guardian temp credentials with verified bcrypt hash
-- Date: 2025-10-12
-- NOTE: Run this after manually clearing temporary_credentials table

-- Insert 5 temp credentials with correct bcrypt hash for password: TempPass123!
-- Hash verified: $2b$12$GkXFvIZYA4/lxux1j0cDsu/PhypAQGJCWPIFAREqMj6bOHwGquw96

INSERT INTO temporary_credentials (
    user_id,
    temp_code,
    temp_password,
    expires_at,
    is_used,
    created_at
) VALUES 
-- 1. Sarah Mensah - Michael Boateng (GIT)
(
    'cc111111-1111-1111-1111-111111111111'::UUID,
    'lumtempcode-a1111111-0001-4001-8001-000000000001',
    '$2b$12$GkXFvIZYA4/lxux1j0cDsu/PhypAQGJCWPIFAREqMj6bOHwGquw96',
    NOW() + INTERVAL '5 days',
    false,
    NOW()
),
-- 2. John Asante - Ama Gyasi (GIT)
(
    'cc222222-2222-2222-2222-222222222222'::UUID,
    'lumtempcode-a2222222-0002-4002-8002-000000000002',
    '$2b$12$GkXFvIZYA4/lxux1j0cDsu/PhypAQGJCWPIFAREqMj6bOHwGquw96',
    NOW() + INTERVAL '5 days',
    false,
    NOW()
),
-- 3. Grace Osei - Kwabena Owusu (Ashesi)
(
    'cc333333-3333-3333-3333-333333333333'::UUID,
    'lumtempcode-a3333333-0003-4003-8003-000000000003',
    '$2b$12$GkXFvIZYA4/lxux1j0cDsu/PhypAQGJCWPIFAREqMj6bOHwGquw96',
    NOW() + INTERVAL '5 days',
    false,
    NOW()
),
-- 4. Emmanuel Boateng - Efua Ansah (Ashesi)
(
    'cc444444-4444-4444-4444-444444444444'::UUID,
    'lumtempcode-a4444444-0004-4004-8004-000000000004',
    '$2b$12$GkXFvIZYA4/lxux1j0cDsu/PhypAQGJCWPIFAREqMj6bOHwGquw96',
    NOW() + INTERVAL '5 days',
    false,
    NOW()
),
-- 5. Abena Owusu - Yaw Appiah (ATU)
(
    'cc555555-5555-5555-5555-555555555555'::UUID,
    'lumtempcode-a5555555-0005-4005-8005-000000000005',
    '$2b$12$GkXFvIZYA4/lxux1j0cDsu/PhypAQGJCWPIFAREqMj6bOHwGquw96',
    NOW() + INTERVAL '5 days',
    false,
    NOW()
);

-- Display success message
SELECT 
    '✅ SUCCESS! 5 Guardian Temp Credentials Created' as status,
    COUNT(*) as total_credentials,
    COUNT(*) FILTER (WHERE is_used = false) as unused_credentials,
    COUNT(*) FILTER (WHERE expires_at > NOW()) as valid_credentials
FROM temporary_credentials
WHERE temp_code LIKE 'lumtempcode-a%';

-- Display the credentials for testing
DO $$
DECLARE
    rec RECORD;
    counter INT := 1;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║           🎓 GUARDIAN TEST CREDENTIALS - READY TO USE                      ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE 'Password for ALL credentials: TempPass123!';
    RAISE NOTICE '';
    
    FOR rec IN 
        SELECT temp_code, u.email as student_email, u.name as student_name
        FROM temporary_credentials tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.temp_code LIKE 'lumtempcode-a%'
        ORDER BY tc.temp_code
    LOOP
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '%️⃣  Student: %', counter, rec.student_name;
        RAISE NOTICE '   Temp Code: %', rec.temp_code;
        RAISE NOTICE '   Password:  TempPass123!';
        RAISE NOTICE '   Email:     %', rec.student_email;
        counter := counter + 1;
    END LOOP;
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST INSTRUCTIONS:';
    RAISE NOTICE '   1. Go to login page';
    RAISE NOTICE '   2. Username: (any temp code above)';
    RAISE NOTICE '   3. Password: TempPass123!';
    RAISE NOTICE '   4. Should redirect to /ecosystem with password change modal';
    RAISE NOTICE '';
    RAISE NOTICE '✨ All credentials expire in 5 days from now';
    RAISE NOTICE '';
END $$;
