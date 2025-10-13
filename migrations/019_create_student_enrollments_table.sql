-- Migration: Create student_enrollments table
-- Description: Tracks student enrollment in organizations with institution reference
-- Date: 2025-10-12

-- Student enrollment tracking
CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    student_id UUID NOT NULL,
    enrollment_status VARCHAR(50) DEFAULT 'PENDING',
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    academic_year VARCHAR(20),
    grade_level VARCHAR(50),
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_enrollment_organization FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_creator FOREIGN KEY (created_by) 
        REFERENCES users(id),
    CONSTRAINT unique_student_enrollment UNIQUE(organization_id, student_id, academic_year)
);

-- Indexes for performance
CREATE INDEX idx_student_enrollments_org_id ON student_enrollments(organization_id);
CREATE INDEX idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_status ON student_enrollments(enrollment_status);
CREATE INDEX idx_student_enrollments_created_by ON student_enrollments(created_by);
CREATE INDEX idx_student_enrollments_academic_year ON student_enrollments(academic_year);

-- Comments for documentation
COMMENT ON TABLE student_enrollments IS 'Tracks student enrollment in organizations with institution reference';
COMMENT ON COLUMN student_enrollments.organization_id IS 'CRITICAL: Reference to the institution/organization - ALWAYS required';
COMMENT ON COLUMN student_enrollments.student_id IS 'Reference to the ORG_WARD user account';
COMMENT ON COLUMN student_enrollments.enrollment_status IS 'Status: PENDING, ACTIVE, COMPLETED, WITHDRAWN';
COMMENT ON COLUMN student_enrollments.academic_year IS 'Academic year for enrollment (e.g., 2025-2026)';
COMMENT ON COLUMN student_enrollments.grade_level IS 'Grade level or class (e.g., Grade 10, Year 1)';
COMMENT ON COLUMN student_enrollments.created_by IS 'The org admin who created this enrollment';
