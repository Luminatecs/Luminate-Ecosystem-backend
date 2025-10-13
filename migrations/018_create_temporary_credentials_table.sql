-- Migration: Create temporary_credentials table
-- Description: Stores temporary login credentials sent to guardians
-- Date: 2025-10-12

-- Temporary credentials for first-time org ward login
CREATE TABLE IF NOT EXISTS temporary_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    temp_code VARCHAR(255) UNIQUE NOT NULL,
    temp_password VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_temp_cred_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_temp_code_format CHECK (temp_code LIKE 'lumtempcode-%')
);

-- Indexes for performance
CREATE INDEX idx_temporary_credentials_temp_code ON temporary_credentials(temp_code);
CREATE INDEX idx_temporary_credentials_user_id ON temporary_credentials(user_id);
CREATE INDEX idx_temporary_credentials_expires_at ON temporary_credentials(expires_at);

-- Comments for documentation
COMMENT ON TABLE temporary_credentials IS 'Stores temporary login credentials sent to guardians via email';
COMMENT ON COLUMN temporary_credentials.user_id IS 'Reference to the ORG_WARD user account';
COMMENT ON COLUMN temporary_credentials.temp_code IS 'Temporary code format: lumtempcode-{uuid}';
COMMENT ON COLUMN temporary_credentials.temp_password IS 'Hashed temporary password';
COMMENT ON COLUMN temporary_credentials.expires_at IS 'Credentials expire 5 days after creation';
COMMENT ON COLUMN temporary_credentials.is_used IS 'Marked true after password change to prevent reuse';
