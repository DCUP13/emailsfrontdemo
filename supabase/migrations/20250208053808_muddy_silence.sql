/*
  # Email Deletion Trigger

  1. New Functions
    - `handle_email_deletion()`: Automatically removes campaign emails when sender emails are deleted

  2. Changes
    - Adds triggers to both amazon_ses_emails and google_smtp_emails tables
    - Automatically maintains referential integrity between email settings and campaigns
    - Prevents orphaned email entries in campaigns

  3. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
    - Restricted to only necessary operations
*/

-- Create a function to handle email deletions
CREATE OR REPLACE FUNCTION handle_email_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete campaign emails when an SES email is deleted
  IF TG_TABLE_NAME = 'amazon_ses_emails' THEN
    DELETE FROM campaign_emails 
    WHERE email_address = OLD.address 
    AND provider = 'amazon';
  -- Delete campaign emails when a Gmail email is deleted
  ELSIF TG_TABLE_NAME = 'google_smtp_emails' THEN
    DELETE FROM campaign_emails 
    WHERE email_address = OLD.address 
    AND provider = 'gmail';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for both email tables
DROP TRIGGER IF EXISTS on_amazon_ses_email_deleted ON amazon_ses_emails;
CREATE TRIGGER on_amazon_ses_email_deleted
  AFTER DELETE ON amazon_ses_emails
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_deletion();

DROP TRIGGER IF EXISTS on_google_smtp_email_deleted ON google_smtp_emails;
CREATE TRIGGER on_google_smtp_email_deleted
  AFTER DELETE ON google_smtp_emails
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_deletion();