/*
  # Add template type to campaign templates

  1. Changes
    - Add template_type column to campaign_templates table
    - Set default value to 'body'
    - Add check constraint to ensure valid values
    - Backfill existing rows with default value
*/

-- Add template_type column with check constraint
ALTER TABLE campaign_templates 
ADD COLUMN template_type text NOT NULL DEFAULT 'body'
CHECK (template_type IN ('body', 'attachment'));

-- Update the query in the AppPage component to include template_type
COMMENT ON TABLE campaign_templates IS 'Stores campaign template associations with their type (body/attachment)';