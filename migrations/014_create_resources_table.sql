-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('students', 'parents', 'counselors')),
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    link VARCHAR(500),
    featured BOOLEAN DEFAULT FALSE,
    image VARCHAR(500),
    features JSONB DEFAULT '[]'::jsonb,
    duration VARCHAR(100),
    difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    tags JSONB DEFAULT '[]'::jsonb,
    free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(featured);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_resources_updated_at();
