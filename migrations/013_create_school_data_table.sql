-- Migration: Create school_data table for library functionality
-- This table will store all school information for the library search feature

CREATE TABLE IF NOT EXISTS school_data (
    "S.N" SERIAL PRIMARY KEY,
    "REGION" VARCHAR(255),
    "DISTRICT" VARCHAR(255),
    "SCHOOL" VARCHAR(500),
    "CATEGORIES" VARCHAR(255),
    "LOCATION" VARCHAR(255),
    "GENDER" VARCHAR(50),
    "RESIDENCY" VARCHAR(50),
    "EMAIL ADDRESS" VARCHAR(255),
    "Categories2" VARCHAR(255),
    "electives" TEXT,
    "core" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_school_data_school ON school_data("SCHOOL");
CREATE INDEX IF NOT EXISTS idx_school_data_district ON school_data("DISTRICT");
CREATE INDEX IF NOT EXISTS idx_school_data_region ON school_data("REGION");
CREATE INDEX IF NOT EXISTS idx_school_data_categories ON school_data("CATEGORIES");

-- Insert some sample data for testing
INSERT INTO school_data (
    "REGION", "DISTRICT", "SCHOOL", "CATEGORIES", "LOCATION", 
    "GENDER", "RESIDENCY", "EMAIL ADDRESS", "Categories2", 
    "electives", "core"
) VALUES 
(
    'Greater Accra', 'Accra Metropolitan', 'Accra Academy Senior High School', 
    'Public', 'Accra', 'Boys Only', 'Boarding & Day', 'info@accraacademy.edu.gh',
    'Category A', 'Science, Arts, Business', 'Mathematics, English, Science, Social Studies'
),
(
    'Ashanti', 'Kumasi Metropolitan', 'Prempeh College', 
    'Public', 'Kumasi', 'Boys Only', 'Boarding & Day', 'info@prempehcollege.edu.gh',
    'Category A', 'Science, Arts, Business', 'Mathematics, English, Science, Social Studies'
),
(
    'Western', 'Sekondi-Takoradi Metropolitan', 'Sekondi College', 
    'Public', 'Sekondi', 'Boys Only', 'Boarding & Day', 'info@sekondcollege.edu.gh',
    'Category A', 'Science, Arts, Business', 'Mathematics, English, Science, Social Studies'
),
(
    'Eastern', 'New Juaben Municipal', 'Pope John Senior High School and Minor Seminary', 
    'Private', 'Koforidua', 'Boys Only', 'Boarding', 'info@popejohn.edu.gh',
    'Category A', 'Science, Arts', 'Mathematics, English, Science, Social Studies, Religious Studies'
),
(
    'Greater Accra', 'Ga West Municipal', 'Presbyterian Boys Secondary School', 
    'Private', 'Legon', 'Boys Only', 'Boarding & Day', 'info@presboys.edu.gh',
    'Category A', 'Science, Arts, Business', 'Mathematics, English, Science, Social Studies'
),
(
    'Central', 'Cape Coast Metropolitan', 'University of Cape Coast School', 
    'Public', 'Cape Coast', 'Mixed', 'Day', 'info@uccshs.edu.gh',
    'Category B', 'Science, Arts', 'Mathematics, English, Science, Social Studies'
),
(
    'Northern', 'Tamale Metropolitan', 'Tamale Senior High School', 
    'Public', 'Tamale', 'Mixed', 'Boarding & Day', 'info@tamaleshs.edu.gh',
    'Category B', 'Science, Arts, Business', 'Mathematics, English, Science, Social Studies'
),
(
    'Volta', 'Ho Municipal', 'Ho Technical Institute', 
    'Public', 'Ho', 'Mixed', 'Boarding & Day', 'info@hotecinst.edu.gh',
    'Technical', 'Technical, Vocational', 'Mathematics, English, Technical Drawing, Workshop Practice'
),
(
    'Upper East', 'Bolgatanga Municipal', 'Bolgatanga Senior High School', 
    'Public', 'Bolgatanga', 'Mixed', 'Boarding & Day', 'info@bolgashs.edu.gh',
    'Category B', 'Science, Arts', 'Mathematics, English, Science, Social Studies'
),
(
    'Upper West', 'Wa Municipal', 'Wa Senior High School', 
    'Public', 'Wa', 'Mixed', 'Boarding & Day', 'info@washs.edu.gh',
    'Category B', 'Science, Arts', 'Mathematics, English, Science, Social Studies'
);

-- Update the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_school_data_updated_at 
    BEFORE UPDATE ON school_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
