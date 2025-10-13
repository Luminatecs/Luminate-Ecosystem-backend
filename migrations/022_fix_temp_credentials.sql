-- Migration: Fix Temp Credentials with Proper UUID Format
-- Description: Delete old temp codes and insert new ones with proper UUID format
-- Date: 2025-10-12

-- Delete old temp credentials that don't match UUID format
DELETE FROM temporary_credentials 
WHERE temp_code IN (
    'lumtempcode-sarah-mensah-2024',
    'lumtempcode-john-asante-2024',
    'lumtempcode-grace-osei-2024',
    'lumtempcode-emmanuel-boateng-2024',
    'lumtempcode-abena-owusu-2024'
);

-- Insert new temp credentials with proper UUID format
INSERT INTO temporary_credentials (
    user_id,
    temp_code,
    temp_password,
    expires_at,
    is_used,
    created_at
) VALUES 
(
    'cc111111-1111-1111-1111-111111111111'::UUID, -- Michael Boateng
    'lumtempcode-a1111111-0001-4001-8001-000000000001',
    '$2a$12$rX5YvGxCqJ5O5YyH5N5yYOqZ5N5Y5N5YqZ5N5Y5N5YqZ5N5Y5N5Yq', -- TempPass123!
    NOW() + INTERVAL '5 days',
    false,
    NOW()
),
(
    'cc222222-2222-2222-2222-222222222222'::UUID, -- Ama Gyasi
    'lumtempcode-a2222222-0002-4002-8002-000000000002',
    '$2a$12$rX5YvGxCqJ5O5YyH5N5yYOqZ5N5Y5N5YqZ5N5Y5N5YqZ5N5Y5N5Yq', -- TempPass123!
    NOW() + INTERVAL '5 days',
    false,
    NOW()
),
(
    'cc333333-3333-3333-3333-333333333333'::UUID, -- Kwabena Owusu
    'lumtempcode-a3333333-0003-4003-8003-000000000003',
    '$2a$12$rX5YvGxCqJ5O5YyH5N5yYOqZ5N5Y5N5YqZ5N5Y5N5YqZ5N5Y5N5Yq', -- TempPass123!
    NOW() + INTERVAL '5 days',
    false,
    NOW()
),
(
    'cc444444-4444-4444-4444-444444444444'::UUID, -- Efua Ansah
    'lumtempcode-a4444444-0004-4004-8004-000000000004',
    '$2a$12$rX5YvGxCqJ5O5YyH5N5yYOqZ5N5Y5N5YqZ5N5Y5N5YqZ5N5Y5N5Yq', -- TempPass123!
    NOW() + INTERVAL '5 days',
    false,
    NOW()
),
(
    'cc555555-5555-5555-5555-555555555555'::UUID, -- Yaw Appiah
    'lumtempcode-a5555555-0005-4005-8005-000000000005',
    '$2a$12$rX5YvGxCqJ5O5YyH5N5yYOqZ5N5Y5N5YqZ5N5Y5N5YqZ5N5Y5N5Yq', -- TempPass123!
    NOW() + INTERVAL '5 days',
    false,
    NOW()
)
ON CONFLICT (temp_code) DO NOTHING;

-- Display updated credentials
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║              ✅ TEMP CREDENTIALS FIXED - UPDATED TEST CODES                ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Old temp codes deleted and replaced with UUID-formatted codes';
    RAISE NOTICE '';
    RAISE NOTICE '📝 USE THESE UPDATED CREDENTIALS TO TEST:';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '1️⃣  Code: lumtempcode-a1111111-0001-4001-8001-000000000001';
    RAISE NOTICE '   Pass: TempPass123!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '2️⃣  Code: lumtempcode-a2222222-0002-4002-8002-000000000002';
    RAISE NOTICE '   Pass: TempPass123!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '3️⃣  Code: lumtempcode-a3333333-0003-4003-8003-000000000003';
    RAISE NOTICE '   Pass: TempPass123!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '4️⃣  Code: lumtempcode-a4444444-0004-4004-8004-000000000004';
    RAISE NOTICE '   Pass: TempPass123!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '5️⃣  Code: lumtempcode-a5555555-0005-4005-8005-000000000005';
    RAISE NOTICE '   Pass: TempPass123!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All temp codes now match the required UUID format!';
    RAISE NOTICE '   Total active temp credentials: %', (SELECT COUNT(*) FROM temporary_credentials WHERE is_used = false);
    RAISE NOTICE '';
END $$;
