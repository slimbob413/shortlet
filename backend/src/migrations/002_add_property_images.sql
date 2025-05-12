-- Add images column to properties table
ALTER TABLE properties ADD COLUMN images TEXT[] DEFAULT '{}'::TEXT[]; 