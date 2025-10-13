-- Migration: Create guardians table
-- Description: Stores guardian/parent information for org ward students
-- Date: 2025-10-12

-- Guardian information table
CREATE TABLE IF NOT EXISTS guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    relation VARCHAR(100) NOT NULL,
    age INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_guardian_student FOREIGN KEY (student_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_guardians_student_id ON guardians(student_id);
CREATE INDEX idx_guardians_email ON guardians(email);

-- Comments for documentation
COMMENT ON TABLE guardians IS 'Stores guardian/parent information for org ward students';
COMMENT ON COLUMN guardians.student_id IS 'Reference to the student user account';
COMMENT ON COLUMN guardians.name IS 'Full name of the guardian';
COMMENT ON COLUMN guardians.email IS 'Guardian email for notifications and credentials';
COMMENT ON COLUMN guardians.phone IS 'Guardian contact phone number';
COMMENT ON COLUMN guardians.relation IS 'Relationship to student (e.g., Parent, Guardian, Uncle, Aunt)';
COMMENT ON COLUMN guardians.age IS 'Guardian age (optional)';
