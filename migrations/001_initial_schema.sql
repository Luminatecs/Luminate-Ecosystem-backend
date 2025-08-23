-- =============================================================================
-- LUMINATE ECOSYSTEM - INITIAL SCHEMA MIGRATION
-- Career Guidance Application Database Schema
-- =============================================================================

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext"; -- Case-insensitive text

-- =============================================================================
-- ENUMS
-- =============================================================================

-- User role enum
CREATE TYPE user_role AS ENUM (
    'INDIVIDUAL',       -- Individual users (self-registered)
    'ORG_WARD',        -- Organization ward (students)
    'ORG_ADMIN',       -- Organization administrators
    'SUPER_ADMIN'      -- System administrators
);

-- Education level enum
CREATE TYPE education_level AS ENUM (
    'HIGH_SCHOOL',
    'UNDERGRADUATE', 
    'GRADUATE',
    'POSTGRADUATE',
    'DOCTORATE',
    'CERTIFICATE',
    'DIPLOMA',
    'OTHER'
);

-- Industry type enum
CREATE TYPE industry_type AS ENUM (
    'EDUCATION',
    'HEALTHCARE',
    'TECHNOLOGY',
    'FINANCE',
    'MANUFACTURING',
    'GOVERNMENT',
    'NON_PROFIT',
    'OTHER'
);

-- Admin type enum
CREATE TYPE admin_type AS ENUM (
    'ORG_ADMIN',
    'SUPER_ADMIN'
);

-- Token status enum
CREATE TYPE token_status AS ENUM (
    'ACTIVE',
    'USED',
    'EXPIRED',
    'REVOKED'
);

-- Gender enum
CREATE TYPE gender_type AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'PREFER_NOT_TO_SAY'
);

-- =============================================================================
-- ORGANIZATIONS TABLE
-- =============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    industry_type industry_type NOT NULL DEFAULT 'OTHER',
    website VARCHAR(255),
    contact_email CITEXT NOT NULL,
    contact_phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    admin_id UUID, -- Will be set after users table is created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- USERS TABLE
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL, -- Full name for individuals, first+last for others
    role user_role NOT NULL DEFAULT 'INDIVIDUAL',
    education_level education_level,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    is_org_ward BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_org_ward_has_org CHECK (
        (is_org_ward = false) OR 
        (is_org_ward = true AND organization_id IS NOT NULL)
    ),
    CONSTRAINT chk_org_admin_has_org CHECK (
        (role != 'ORG_ADMIN') OR 
        (role = 'ORG_ADMIN' AND organization_id IS NOT NULL)
    )
);

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    gender gender_type,
    phone_number VARCHAR(20),
    profile_image_url TEXT,
    bio TEXT,
    interests TEXT[], -- Array of interests
    career_goals TEXT[], -- Array of career goals
    current_institution VARCHAR(100),
    graduation_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_graduation_year CHECK (
        graduation_year IS NULL OR 
        (graduation_year >= 1900 AND graduation_year <= EXTRACT(YEAR FROM NOW()) + 10)
    )
);

-- =============================================================================
-- REGISTRATION TOKENS TABLE
-- =============================================================================

CREATE TABLE registration_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(32) NOT NULL UNIQUE, -- Alphanumeric token
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    used_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status token_status NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_token_format CHECK (token ~ '^[A-Za-z0-9]{8,32}$'),
    CONSTRAINT chk_used_when_status_used CHECK (
        (status != 'USED') OR 
        (status = 'USED' AND used_by IS NOT NULL AND used_at IS NOT NULL)
    )
);

-- =============================================================================
-- ADMIN DETAILS TABLE
-- =============================================================================

CREATE TABLE admin_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    admin_type admin_type NOT NULL,
    permissions TEXT[], -- Array of permission strings
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- EMAIL VERIFICATION TOKENS TABLE
-- =============================================================================

CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Only one active token per user
    CONSTRAINT uq_active_verification_token UNIQUE (user_id, expires_at)
);

-- =============================================================================
-- PASSWORD RESET TOKENS TABLE
-- =============================================================================

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- USER ACTIVITY LOG TABLE
-- =============================================================================

CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Add foreign key constraint for organization admin
ALTER TABLE organizations 
ADD CONSTRAINT fk_organizations_admin_id 
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_is_org_ward ON users(is_org_ward);
CREATE INDEX idx_users_education_level ON users(education_level);

-- Organizations table indexes
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_industry_type ON organizations(industry_type);
CREATE INDEX idx_organizations_admin_id ON organizations(admin_id);

-- Registration tokens indexes
CREATE INDEX idx_registration_tokens_token ON registration_tokens(token);
CREATE INDEX idx_registration_tokens_organization_id ON registration_tokens(organization_id);
CREATE INDEX idx_registration_tokens_status ON registration_tokens(status);
CREATE INDEX idx_registration_tokens_expires_at ON registration_tokens(expires_at);
CREATE INDEX idx_registration_tokens_generated_by ON registration_tokens(generated_by);

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_current_institution ON user_profiles(current_institution);

-- Admin details indexes
CREATE INDEX idx_admin_details_user_id ON admin_details(user_id);
CREATE INDEX idx_admin_details_admin_type ON admin_details(admin_type);
CREATE INDEX idx_admin_details_is_active ON admin_details(is_active);

-- Email verification tokens indexes
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Password reset tokens indexes
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- User activity logs indexes
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at column
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_details_updated_at 
    BEFORE UPDATE ON admin_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log user activities
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type VARCHAR(50),
    p_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_logs (
        user_id,
        activity_type,
        description,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_description,
        p_ip_address,
        p_user_agent,
        p_metadata
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Update expired registration tokens
    UPDATE registration_tokens 
    SET status = 'EXPIRED' 
    WHERE status = 'ACTIVE' AND expires_at < NOW();
    
    -- Delete old email verification tokens (older than 30 days)
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW() - INTERVAL '30 days';
    
    -- Delete old password reset tokens (older than 7 days)
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
