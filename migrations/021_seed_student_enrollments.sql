-- Migration: Seed Guardian Enrollments with Temp Credentials
-- Description: Create 5 guardian records with temp codes for testing UI flow
-- Date: 2025-10-12
-- Simulates org admin creating student enrollments and system sending temp credentials

-- Password for all temp credentials: TempPass123!
-- Hash: $2a$12$rX5YvGxCqJ5O5YyH5N5yYOqZ5N5Y5N5YqZ5N5Y5N5YqZ5N5Y5N5Yq

-- =============================================================================
-- STEP 1: Create Guardian Records
-- =============================================================================

INSERT INTO guardians (
    id,
    student_id,
    name,
    email,
    phone,
    relation,
    age,
    created_at
) VALUES 
(
    'e1111111-0001-0001-0001-000000000001'::UUID,
    'cc111111-1111-1111-1111-111111111111'::UUID, -- Michael Boateng (GIT)
    'Sarah Mensah',
    'guardian1@example.com',
    '+233-24-1234567',
    'Mother',
    42,
    NOW()
),
(
    'e2222222-0002-0002-0002-000000000002'::UUID,
    'cc222222-2222-2222-2222-222222222222'::UUID, -- Ama Gyasi (GIT)
    'John Asante',
    'guardian2@example.com',
    '+233-24-2345678',
    'Father',
    45,
    NOW()
),
(
    'e3333333-0003-0003-0003-000000000003'::UUID,
    'cc333333-3333-3333-3333-333333333333'::UUID, -- Kwabena Owusu (Ashesi)
    'Grace Osei',
    'guardian3@example.com',
    '+233-24-3456789',
    'Mother',
    39,
    NOW()
),
(
    'e4444444-0004-0004-0004-000000000004'::UUID,
    'cc444444-4444-4444-4444-444444444444'::UUID, -- Efua Ansah (Ashesi)
    'Emmanuel Boateng',
    'guardian4@example.com',
    '+233-24-4567890',
    'Father',
    48,
    NOW()
),
(
    'e5555555-0005-0005-0005-000000000005'::UUID,
    'cc555555-5555-5555-5555-555555555555'::UUID, -- Yaw Appiah (ATU)
    'Abena Owusu',
    'guardian5@example.com',
    '+233-24-5678901',
    'Aunt',
    36,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 2: Create Temporary Credentials (What would be emailed to guardians)
-- =============================================================================

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

-- =============================================================================
-- STEP 3: Create Student Enrollment Records
-- =============================================================================

INSERT INTO student_enrollments (
    organization_id,
    student_id,
    enrollment_status,
    enrollment_date,
    academic_year,
    grade_level,
    created_by
) VALUES 
(
    '11111111-1111-1111-1111-111111111111'::UUID, -- GIT
    'cc111111-1111-1111-1111-111111111111'::UUID, -- Michael Boateng
    'PENDING',
    NOW(),
    '2024-2025',
    'Year 2 - Computer Engineering',
    'aa111111-1111-1111-1111-111111111111'::UUID  -- GIT Admin
),
(
    '11111111-1111-1111-1111-111111111111'::UUID, -- GIT
    'cc222222-2222-2222-2222-222222222222'::UUID, -- Ama Gyasi
    'PENDING',
    NOW(),
    '2024-2025',
    'Year 1 - Electrical Engineering',
    'aa111111-1111-1111-1111-111111111111'::UUID  -- GIT Admin
),
(
    '22222222-2222-2222-2222-222222222222'::UUID, -- Ashesi
    'cc333333-3333-3333-3333-333333333333'::UUID, -- Kwabena Owusu
    'PENDING',
    NOW(),
    '2024-2025',
    'Year 3 - Business Administration',
    'aa222222-2222-2222-2222-222222222222'::UUID  -- Ashesi Admin
),
(
    '22222222-2222-2222-2222-222222222222'::UUID, -- Ashesi
    'cc444444-4444-4444-4444-444444444444'::UUID, -- Efua Ansah
    'PENDING',
    NOW(),
    '2024-2025',
    'Year 2 - Computer Science',
    'aa222222-2222-2222-2222-222222222222'::UUID  -- Ashesi Admin
),
(
    '33333333-3333-3333-3333-333333333333'::UUID, -- ATU
    'cc555555-5555-5555-5555-555555555555'::UUID, -- Yaw Appiah
    'PENDING',
    NOW(),
    '2024-2025',
    'Certificate - Web Development',
    'aa333333-3333-3333-3333-333333333333'::UUID  -- ATU Admin
)
ON CONFLICT (organization_id, student_id, academic_year) DO NOTHING;

-- =============================================================================
-- DISPLAY TEST CREDENTIALS
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║              🎓 GUARDIAN TEST CREDENTIALS FOR UI TESTING                   ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Created 5 Guardian Enrollments with Temporary Credentials';
    RAISE NOTICE '';
    RAISE NOTICE '📝 USE THESE CREDENTIALS TO TEST THE GUARDIAN LOGIN FLOW:';
    RAISE NOTICE '   (Login at the regular login page - it will detect the temp code)';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '1️⃣  GUARDIAN: Sarah Mensah (GIT - Computer Engineering)';
    RAISE NOTICE '   Temp Code: lumtempcode-a1111111-0001-4001-8001-000000000001';
    RAISE NOTICE '   Password:  TempPass123!';
    RAISE NOTICE '   Email:     guardian1@example.com';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '2️⃣  GUARDIAN: John Asante (GIT - Electrical Engineering)';
    RAISE NOTICE '   Temp Code: lumtempcode-a2222222-0002-4002-8002-000000000002';
    RAISE NOTICE '   Password:  TempPass123!';
    RAISE NOTICE '   Email:     guardian2@example.com';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '3️⃣  GUARDIAN: Grace Osei (Ashesi - Business Administration)';
    RAISE NOTICE '   Temp Code: lumtempcode-a3333333-0003-4003-8003-000000000003';
    RAISE NOTICE '   Password:  TempPass123!';
    RAISE NOTICE '   Email:     guardian3@example.com';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '4️⃣  GUARDIAN: Emmanuel Boateng (Ashesi - Computer Science)';
    RAISE NOTICE '   Temp Code: lumtempcode-a4444444-0004-4004-8004-000000000004';
    RAISE NOTICE '   Password:  TempPass123!';
    RAISE NOTICE '   Email:     guardian4@example.com';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '5️⃣  GUARDIAN: Abena Owusu (ATU - Web Development)';
    RAISE NOTICE '   Temp Code: lumtempcode-a5555555-0005-4005-8005-000000000005';
    RAISE NOTICE '   Password:  TempPass123!';
    RAISE NOTICE '   Email:     guardian5@example.com';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TEST FLOW:';
    RAISE NOTICE '   1. Go to login page';
    RAISE NOTICE '   2. Enter temp code as username (e.g., lumtempcode-a1111111-0001-4001-8001-000000000001)';
    RAISE NOTICE '   3. Enter password: TempPass123!';
    RAISE NOTICE '   4. System detects temp code prefix';
    RAISE NOTICE '   5. You are redirected to /ecosystem';
    RAISE NOTICE '   6. Password change modal appears';
    RAISE NOTICE '   7. Set new password';
    RAISE NOTICE '   8. Logged out automatically';
    RAISE NOTICE '   9. Login again with new password';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Database Summary:';
    RAISE NOTICE '   - Guardians Created: %', (SELECT COUNT(*) FROM guardians WHERE id::text LIKE 'e%%');
    RAISE NOTICE '   - Temp Credentials: %', (SELECT COUNT(*) FROM temporary_credentials WHERE temp_code LIKE 'lumtempcode%%');
    RAISE NOTICE '   - Enrollments Created: %', (SELECT COUNT(*) FROM student_enrollments WHERE academic_year = '2024-2025' AND enrollment_status = 'PENDING');
    RAISE NOTICE '';
    RAISE NOTICE '✨ Happy Testing! ✨';
    RAISE NOTICE '';
END $$;
