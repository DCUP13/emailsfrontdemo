/*
  # Add subject lines to campaigns

  1. Changes
    - Add subject_lines column to campaigns table as a text array
    - Set default value to empty array
    - Add comment for documentation
*/

-- Add subject_lines column as text array
ALTER TABLE campaigns 
ADD COLUMN subject_lines text[] NOT NULL DEFAULT '{}';

-- Add documentation
COMMENT ON COLUMN campaigns.subject_lines IS 'Array of subject lines to be used in campaign emails';