-- Migration: Create password_reset_tokens table
-- Description: Stores password reset tokens for forgot password functionality
-- Date: 2025-10-12

-- Password reset tokens for forgot password flow
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_reset_token_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Add is_used column if it doesn't exist (for partial migration recovery)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'password_reset_tokens' AND column_name = 'is_used'
    ) THEN
        ALTER TABLE password_reset_tokens ADD COLUMN is_used BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Comments for documentation (only add if table and columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'password_reset_tokens') THEN
        COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens for forgot password functionality';
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'password_reset_tokens' AND column_name = 'user_id') THEN
            COMMENT ON COLUMN password_reset_tokens.user_id IS 'Reference to the user requesting password reset';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'password_reset_tokens' AND column_name = 'token') THEN
            COMMENT ON COLUMN password_reset_tokens.token IS 'Unique token sent in reset email link';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'password_reset_tokens' AND column_name = 'expires_at') THEN
            COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Tokens expire 1 hour after creation';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'password_reset_tokens' AND column_name = 'is_used') THEN
            COMMENT ON COLUMN password_reset_tokens.is_used IS 'Marked true after successful password reset to prevent reuse';
        END IF;
    END IF;
END $$;
