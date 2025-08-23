-- =============================================================================
-- LUMINATE ECOSYSTEM - SEED DATA MIGRATION
-- Comprehensive dummy data for testing and development
-- =============================================================================

-- Note: All passwords are 'password123' hashed with bcrypt (12 rounds)
-- Hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

INSERT INTO organizations (id, name, description, industry_type, website, contact_email, contact_phone, address) VALUES 
-- Educational Institutions
(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Ghana Institute of Technology',
    'Leading technical university in Ghana specializing in engineering, technology, and applied sciences.',
    'EDUCATION',
    'https://git.edu.gh',
    'info@git.edu.gh',
    '+233-30-2123456',
    'University Campus, Accra, Ghana'
),
(
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Ashesi University College',
    'Private liberal arts university focused on developing ethical leaders for Africa.',
    'EDUCATION',
    'https://ashesi.edu.gh',
    'admissions@ashesi.edu.gh',
    '+233-30-2610330',
    'Berekuso Campus, Eastern Region, Ghana'
),
(
    '33333333-3333-3333-3333-333333333333'::UUID,
    'Accra Technical University',
    'Technical university offering career-focused programs in technology and business.',
    'EDUCATION',
    'https://atu.edu.gh',
    'info@atu.edu.gh',
    '+233-30-2685395',
    'Barnes Road, Accra, Ghana'
),

-- Healthcare Organizations
(
    '44444444-4444-4444-4444-444444444444'::UUID,
    'Korle-Bu Teaching Hospital',
    'Ghana''s premier medical institution providing healthcare services and medical education.',
    'HEALTHCARE',
    'https://kbth.gov.gh',
    'info@kbth.gov.gh',
    '+233-30-2665401',
    'Korle-Bu, Accra, Ghana'
),

-- Technology Companies
(
    '55555555-5555-5555-5555-555555555555'::UUID,
    'Ghana Tech Solutions',
    'Innovative technology company providing software solutions for African businesses.',
    'TECHNOLOGY',
    'https://ghanatechsolutions.com',
    'contact@ghanatechsolutions.com',
    '+233-24-1234567',
    'East Legon, Accra, Ghana'
),

-- Financial Institutions
(
    '66666666-6666-6666-6666-666666666666'::UUID,
    'GCB Bank Limited',
    'Leading indigenous bank in Ghana providing comprehensive banking services.',
    'FINANCE',
    'https://gcb.com.gh',
    'customercare@gcb.com.gh',
    '+233-30-2664910',
    'High Street, Accra, Ghana'
),

-- Government Organizations
(
    '77777777-7777-7777-7777-777777777777'::UUID,
    'Ministry of Education Ghana',
    'Government ministry responsible for education policy and implementation.',
    'GOVERNMENT',
    'https://moe.gov.gh',
    'info@moe.gov.gh',
    '+233-30-2665421',
    'Ministers Block, Accra, Ghana'
);

-- =============================================================================
-- SUPER ADMIN USER
-- =============================================================================

INSERT INTO users (id, email, password_hash, name, role, is_active, email_verified, email_verified_at) VALUES 
(
    '99999999-9999-9999-9999-999999999999'::UUID,
    'superadmin@luminate-ecosystem.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'System Administrator',
    'SUPER_ADMIN',
    true,
    true,
    NOW()
);

-- Super Admin Details
INSERT INTO admin_details (user_id, admin_type, permissions, is_active) VALUES 
(
    '99999999-9999-9999-9999-999999999999'::UUID,
    'SUPER_ADMIN',
    ARRAY['MANAGE_USERS', 'MANAGE_ORGANIZATIONS', 'SYSTEM_CONFIG', 'VIEW_ANALYTICS', 'MANAGE_TOKENS'],
    true
);

-- Super Admin Profile
INSERT INTO user_profiles (user_id, first_name, last_name, bio) VALUES 
(
    '99999999-9999-9999-9999-999999999999'::UUID,
    'System',
    'Administrator',
    'System administrator responsible for platform management and oversight.'
);

-- =============================================================================
-- ORGANIZATION ADMINISTRATORS
-- =============================================================================

INSERT INTO users (id, email, password_hash, name, role, organization_id, is_active, email_verified, email_verified_at) VALUES 
-- Ghana Institute of Technology Admin
(
    'aa111111-1111-1111-1111-111111111111'::UUID,
    'admin@git.edu.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Dr. Emmanuel Akpan',
    'ORG_ADMIN',
    '11111111-1111-1111-1111-111111111111'::UUID,
    true,
    true,
    NOW()
),
-- Ashesi University Admin
(
    'aa222222-2222-2222-2222-222222222222'::UUID,
    'admin@ashesi.edu.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Prof. Angela Owusu-Ansah',
    'ORG_ADMIN',
    '22222222-2222-2222-2222-222222222222'::UUID,
    true,
    true,
    NOW()
),
-- Accra Technical University Admin
(
    'aa333333-3333-3333-3333-333333333333'::UUID,
    'admin@atu.edu.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Dr. Samuel Danso',
    'ORG_ADMIN',
    '33333333-3333-3333-3333-333333333333'::UUID,
    true,
    true,
    NOW()
),
-- Korle-Bu Teaching Hospital Admin
(
    'aa444444-4444-4444-4444-444444444444'::UUID,
    'admin@kbth.gov.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Dr. Grace Mensah',
    'ORG_ADMIN',
    '44444444-4444-4444-4444-444444444444'::UUID,
    true,
    true,
    NOW()
),
-- Ghana Tech Solutions Admin
(
    'aa555555-5555-5555-5555-555555555555'::UUID,
    'admin@ghanatechsolutions.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Kwame Asante',
    'ORG_ADMIN',
    '55555555-5555-5555-5555-555555555555'::UUID,
    true,
    true,
    NOW()
);

-- Update organizations with admin_id
UPDATE organizations SET admin_id = 'aa111111-1111-1111-1111-111111111111'::UUID WHERE id = '11111111-1111-1111-1111-111111111111'::UUID;
UPDATE organizations SET admin_id = 'aa222222-2222-2222-2222-222222222222'::UUID WHERE id = '22222222-2222-2222-2222-222222222222'::UUID;
UPDATE organizations SET admin_id = 'aa333333-3333-3333-3333-333333333333'::UUID WHERE id = '33333333-3333-3333-3333-333333333333'::UUID;
UPDATE organizations SET admin_id = 'aa444444-4444-4444-4444-444444444444'::UUID WHERE id = '44444444-4444-4444-4444-444444444444'::UUID;
UPDATE organizations SET admin_id = 'aa555555-5555-5555-5555-555555555555'::UUID WHERE id = '55555555-5555-5555-5555-555555555555'::UUID;

-- Admin Details for Organization Admins
INSERT INTO admin_details (user_id, admin_type, permissions, is_active) VALUES 
('aa111111-1111-1111-1111-111111111111'::UUID, 'ORG_ADMIN', ARRAY['MANAGE_STUDENTS', 'GENERATE_TOKENS', 'VIEW_ORG_ANALYTICS'], true),
('aa222222-2222-2222-2222-222222222222'::UUID, 'ORG_ADMIN', ARRAY['MANAGE_STUDENTS', 'GENERATE_TOKENS', 'VIEW_ORG_ANALYTICS'], true),
('aa333333-3333-3333-3333-333333333333'::UUID, 'ORG_ADMIN', ARRAY['MANAGE_STUDENTS', 'GENERATE_TOKENS', 'VIEW_ORG_ANALYTICS'], true),
('aa444444-4444-4444-4444-444444444444'::UUID, 'ORG_ADMIN', ARRAY['MANAGE_STUDENTS', 'GENERATE_TOKENS', 'VIEW_ORG_ANALYTICS'], true),
('aa555555-5555-5555-5555-555555555555'::UUID, 'ORG_ADMIN', ARRAY['MANAGE_STUDENTS', 'GENERATE_TOKENS', 'VIEW_ORG_ANALYTICS'], true);

-- Admin Profiles
INSERT INTO user_profiles (user_id, first_name, last_name, bio, current_institution) VALUES 
('aa111111-1111-1111-1111-111111111111'::UUID, 'Emmanuel', 'Akpan', 'Career guidance coordinator at Ghana Institute of Technology.', 'Ghana Institute of Technology'),
('aa222222-2222-2222-2222-222222222222'::UUID, 'Angela', 'Owusu-Ansah', 'Student affairs director at Ashesi University College.', 'Ashesi University College'),
('aa333333-3333-3333-3333-333333333333'::UUID, 'Samuel', 'Danso', 'Academic affairs coordinator at Accra Technical University.', 'Accra Technical University'),
('aa444444-4444-4444-4444-444444444444'::UUID, 'Grace', 'Mensah', 'Medical education coordinator at Korle-Bu Teaching Hospital.', 'Korle-Bu Teaching Hospital'),
('aa555555-5555-5555-5555-555555555555'::UUID, 'Kwame', 'Asante', 'HR and talent development manager at Ghana Tech Solutions.', 'Ghana Tech Solutions');

-- =============================================================================
-- INDIVIDUAL USERS (Self-registered)
-- =============================================================================

INSERT INTO users (id, email, password_hash, name, role, education_level, is_active, email_verified, email_verified_at) VALUES 
(
    'bb111111-1111-1111-1111-111111111111'::UUID,
    'john.mensah@gmail.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'John Mensah',
    'INDIVIDUAL',
    'UNDERGRADUATE',
    true,
    true,
    NOW()
),
(
    'bb222222-2222-2222-2222-222222222222'::UUID,
    'afia.osei@yahoo.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Afia Osei',
    'INDIVIDUAL',
    'HIGH_SCHOOL',
    true,
    true,
    NOW()
),
(
    'bb333333-3333-3333-3333-333333333333'::UUID,
    'kofi.asante@hotmail.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Kofi Asante',
    'INDIVIDUAL',
    'GRADUATE',
    true,
    false, -- Not verified yet
    NULL
);

-- Individual User Profiles
INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender, bio, interests, career_goals, current_institution, graduation_year) VALUES 
(
    'bb111111-1111-1111-1111-111111111111'::UUID,
    'John',
    'Mensah',
    '2001-05-15',
    'MALE',
    'Computer Science student passionate about artificial intelligence and machine learning.',
    ARRAY['Technology', 'AI/ML', 'Programming', 'Robotics'],
    ARRAY['Software Engineer', 'Data Scientist', 'AI Researcher'],
    'University of Ghana',
    2024
),
(
    'bb222222-2222-2222-2222-222222222222'::UUID,
    'Afia',
    'Osei',
    '2005-09-22',
    'FEMALE',
    'High school student interested in medicine and helping people.',
    ARRAY['Medicine', 'Biology', 'Community Service', 'Reading'],
    ARRAY['Doctor', 'Nurse', 'Medical Researcher'],
    'Achimota Senior High School',
    2023
),
(
    'bb333333-3333-3333-3333-333333333333'::UUID,
    'Kofi',
    'Asante',
    '1998-12-03',
    'MALE',
    'Business graduate looking to start a career in financial services.',
    ARRAY['Finance', 'Business', 'Entrepreneurship', 'Investment'],
    ARRAY['Financial Analyst', 'Investment Banker', 'Entrepreneur'],
    'University of Cape Coast',
    2021
);

-- =============================================================================
-- ORGANIZATION WARD USERS (Students)
-- =============================================================================

INSERT INTO users (id, email, password_hash, name, role, education_level, organization_id, is_org_ward, is_active, email_verified, email_verified_at) VALUES 
-- GIT Students
(
    'cc111111-1111-1111-1111-111111111111'::UUID,
    'student1@git.edu.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Michael Boateng',
    'ORG_WARD',
    'UNDERGRADUATE',
    '11111111-1111-1111-1111-111111111111'::UUID,
    true,
    true,
    true,
    NOW()
),
(
    'cc222222-2222-2222-2222-222222222222'::UUID,
    'student2@git.edu.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Ama Gyasi',
    'ORG_WARD',
    'UNDERGRADUATE',
    '11111111-1111-1111-1111-111111111111'::UUID,
    true,
    true,
    true,
    NOW()
),
-- Ashesi Students
(
    'cc333333-3333-3333-3333-333333333333'::UUID,
    'student1@ashesi.edu.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Kwabena Owusu',
    'ORG_WARD',
    'UNDERGRADUATE',
    '22222222-2222-2222-2222-222222222222'::UUID,
    true,
    true,
    true,
    NOW()
),
(
    'cc444444-4444-4444-4444-444444444444'::UUID,
    'student2@ashesi.edu.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Efua Ansah',
    'ORG_WARD',
    'UNDERGRADUATE',
    '22222222-2222-2222-2222-222222222222'::UUID,
    true,
    true,
    true,
    NOW()
),
-- ATU Students
(
    'cc555555-5555-5555-5555-555555555555'::UUID,
    'student1@atu.edu.gh',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6/8n9QZg1m',
    'Yaw Appiah',
    'ORG_WARD',
    'CERTIFICATE',
    '33333333-3333-3333-3333-333333333333'::UUID,
    true,
    true,
    true,
    NOW()
);

-- Student Profiles
INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, gender, bio, interests, career_goals, current_institution, graduation_year) VALUES 
('cc111111-1111-1111-1111-111111111111'::UUID, 'Michael', 'Boateng', '2002-03-10', 'MALE', 'Engineering student specializing in mechanical systems.', ARRAY['Engineering', 'Mechanics', 'Innovation'], ARRAY['Mechanical Engineer', 'Design Engineer'], 'Ghana Institute of Technology', 2025),
('cc222222-2222-2222-2222-222222222222'::UUID, 'Ama', 'Gyasi', '2001-11-18', 'FEMALE', 'Computer engineering student with interest in cybersecurity.', ARRAY['Cybersecurity', 'Programming', 'Technology'], ARRAY['Cybersecurity Specialist', 'Software Developer'], 'Ghana Institute of Technology', 2024),
('cc333333-3333-3333-3333-333333333333'::UUID, 'Kwabena', 'Owusu', '2000-07-25', 'MALE', 'Business administration student with entrepreneurial ambitions.', ARRAY['Business', 'Leadership', 'Innovation'], ARRAY['Entrepreneur', 'Business Analyst'], 'Ashesi University College', 2024),
('cc444444-4444-4444-4444-444444444444'::UUID, 'Efua', 'Ansah', '2002-01-08', 'FEMALE', 'Computer science student passionate about AI and data science.', ARRAY['AI', 'Data Science', 'Programming'], ARRAY['Data Scientist', 'AI Engineer'], 'Ashesi University College', 2025),
('cc555555-5555-5555-5555-555555555555'::UUID, 'Yaw', 'Appiah', '1999-09-14', 'MALE', 'Technical student focusing on electrical systems.', ARRAY['Electronics', 'Electrical Systems', 'Automation'], ARRAY['Electrical Technician', 'Systems Engineer'], 'Accra Technical University', 2024);

-- =============================================================================
-- REGISTRATION TOKENS
-- =============================================================================

INSERT INTO registration_tokens (token, organization_id, generated_by, status, expires_at) VALUES 
-- GIT Active Tokens
('GIT2024TECH01', '11111111-1111-1111-1111-111111111111'::UUID, 'aa111111-1111-1111-1111-111111111111'::UUID, 'ACTIVE', NOW() + INTERVAL '30 days'),
('GIT2024TECH02', '11111111-1111-1111-1111-111111111111'::UUID, 'aa111111-1111-1111-1111-111111111111'::UUID, 'ACTIVE', NOW() + INTERVAL '30 days'),
('GIT2024TECH03', '11111111-1111-1111-1111-111111111111'::UUID, 'aa111111-1111-1111-1111-111111111111'::UUID, 'ACTIVE', NOW() + INTERVAL '30 days'),

-- Ashesi Active Tokens
('ASH2024STU01', '22222222-2222-2222-2222-222222222222'::UUID, 'aa222222-2222-2222-2222-222222222222'::UUID, 'ACTIVE', NOW() + INTERVAL '30 days'),
('ASH2024STU02', '22222222-2222-2222-2222-222222222222'::UUID, 'aa222222-2222-2222-2222-222222222222'::UUID, 'ACTIVE', NOW() + INTERVAL '30 days'),

-- ATU Active Tokens
('ATU2024CERT01', '33333333-3333-3333-3333-333333333333'::UUID, 'aa333333-3333-3333-3333-333333333333'::UUID, 'ACTIVE', NOW() + INTERVAL '30 days');

-- Used Tokens (for students who already registered) - Insert with complete data
INSERT INTO registration_tokens (token, organization_id, generated_by, status, expires_at, used_by, used_at) VALUES 
('GITUSED001', '11111111-1111-1111-1111-111111111111'::UUID, 'aa111111-1111-1111-1111-111111111111'::UUID, 'USED', NOW() + INTERVAL '30 days', 'cc111111-1111-1111-1111-111111111111'::UUID, NOW() - INTERVAL '5 days'),
('GITUSED002', '11111111-1111-1111-1111-111111111111'::UUID, 'aa111111-1111-1111-1111-111111111111'::UUID, 'USED', NOW() + INTERVAL '30 days', 'cc222222-2222-2222-2222-222222222222'::UUID, NOW() - INTERVAL '3 days'),
('ASHUSED001', '22222222-2222-2222-2222-222222222222'::UUID, 'aa222222-2222-2222-2222-222222222222'::UUID, 'USED', NOW() + INTERVAL '30 days', 'cc333333-3333-3333-3333-333333333333'::UUID, NOW() - INTERVAL '7 days'),
('ASHUSED002', '22222222-2222-2222-2222-222222222222'::UUID, 'aa222222-2222-2222-2222-222222222222'::UUID, 'USED', NOW() + INTERVAL '30 days', 'cc444444-4444-4444-4444-444444444444'::UUID, NOW() - INTERVAL '2 days'),
('ATUUSED001', '33333333-3333-3333-3333-333333333333'::UUID, 'aa333333-3333-3333-3333-333333333333'::UUID, 'USED', NOW() + INTERVAL '30 days', 'cc555555-5555-5555-5555-555555555555'::UUID, NOW() - INTERVAL '10 days');

-- =============================================================================
-- USER ACTIVITY LOGS (Sample Activities)
-- =============================================================================

INSERT INTO user_activity_logs (user_id, activity_type, description, ip_address, user_agent) VALUES 
-- Super Admin Activities
('99999999-9999-9999-9999-999999999999'::UUID, 'LOGIN', 'Super admin logged in', '192.168.1.100'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('99999999-9999-9999-9999-999999999999'::UUID, 'SYSTEM_CONFIG', 'Updated system configuration', '192.168.1.100'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),

-- Organization Admin Activities
('aa111111-1111-1111-1111-111111111111'::UUID, 'LOGIN', 'Organization admin logged in', '192.168.1.101'::INET, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('aa111111-1111-1111-1111-111111111111'::UUID, 'TOKEN_GENERATION', 'Generated registration tokens for students', '192.168.1.101'::INET, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),

-- Student Activities
('cc111111-1111-1111-1111-111111111111'::UUID, 'LOGIN', 'Student logged in', '192.168.1.102'::INET, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'),
('cc111111-1111-1111-1111-111111111111'::UUID, 'PROFILE_UPDATE', 'Updated profile information', '192.168.1.102'::INET, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'),

-- Individual User Activities
('bb111111-1111-1111-1111-111111111111'::UUID, 'LOGIN', 'Individual user logged in', '192.168.1.103'::INET, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('bb222222-2222-2222-2222-222222222222'::UUID, 'EMAIL_VERIFICATION', 'Email verification completed', '192.168.1.104'::INET, 'Mozilla/5.0 (Android 11; Mobile) AppleWebKit/537.36');

-- =============================================================================
-- EMAIL VERIFICATION TOKENS (Sample)
-- =============================================================================

INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES 
-- Pending verification for unverified user
('bb333333-3333-3333-3333-333333333333'::UUID, 'verify_kofi_asante_123456789', NOW() + INTERVAL '24 hours');

-- =============================================================================
-- SUMMARY INFORMATION
-- =============================================================================

-- Display summary of seeded data
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'LUMINATE ECOSYSTEM - SEED DATA SUMMARY';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Organizations: %', (SELECT COUNT(*) FROM organizations);
    RAISE NOTICE 'Total Users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '  - Super Admins: %', (SELECT COUNT(*) FROM users WHERE role = 'SUPER_ADMIN');
    RAISE NOTICE '  - Org Admins: %', (SELECT COUNT(*) FROM users WHERE role = 'ORG_ADMIN');
    RAISE NOTICE '  - Individuals: %', (SELECT COUNT(*) FROM users WHERE role = 'INDIVIDUAL');
    RAISE NOTICE '  - Students: %', (SELECT COUNT(*) FROM users WHERE role = 'ORG_WARD');
    RAISE NOTICE 'Registration Tokens: %', (SELECT COUNT(*) FROM registration_tokens);
    RAISE NOTICE '  - Active: %', (SELECT COUNT(*) FROM registration_tokens WHERE status = 'ACTIVE');
    RAISE NOTICE '  - Used: %', (SELECT COUNT(*) FROM registration_tokens WHERE status = 'USED');
    RAISE NOTICE 'User Profiles: %', (SELECT COUNT(*) FROM user_profiles);
    RAISE NOTICE 'Admin Details: %', (SELECT COUNT(*) FROM admin_details);
    RAISE NOTICE 'Activity Logs: %', (SELECT COUNT(*) FROM user_activity_logs);
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Default Password: password123';
    RAISE NOTICE 'Super Admin: superadmin@luminate-ecosystem.com';
    RAISE NOTICE '=============================================================================';
END $$;
