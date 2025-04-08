/*
  # Add days_till_close to campaigns table

  1. Changes
    - Add `days_till_close` column to `campaigns` table with default value 'NA'
    - This column stores the number of days until close or 'NA' if not applicable
  
  2. Documentation
    - The column accepts text values to allow for 'NA' as well as numeric days
    - Used for tracking campaign timelines and scheduling
*/

-- Add days_till_close column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN days_till_close text NOT NULL DEFAULT 'NA';

-- Add documentation
COMMENT ON COLUMN campaigns.days_till_close IS 'Number of days until close (1-21) or NA if not applicable';