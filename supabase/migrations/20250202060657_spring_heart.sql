/*
  # Add Campaigns Table

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `is_active` (boolean)
      - `city` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `campaign_templates`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references campaigns)
      - `template_id` (uuid, references templates)
      - `created_at` (timestamptz)

    - `campaign_emails`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, references campaigns)
      - `email_address` (text)
      - `provider` (text, either 'amazon' or 'gmail')
      - `sending_rate` (integer, emails per day)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT false,
  city text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaign_templates junction table
CREATE TABLE IF NOT EXISTS campaign_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, template_id)
);

-- Create campaign_emails table
CREATE TABLE IF NOT EXISTS campaign_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  email_address text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('amazon', 'gmail')),
  sending_rate integer NOT NULL CHECK (sending_rate > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_emails ENABLE ROW LEVEL SECURITY;

-- Policies for campaigns
CREATE POLICY "Users can read own campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for campaign_templates
CREATE POLICY "Users can read own campaign templates"
  ON campaign_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_templates.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own campaign templates"
  ON campaign_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_templates.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own campaign templates"
  ON campaign_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_templates.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Policies for campaign_emails
CREATE POLICY "Users can read own campaign emails"
  ON campaign_emails
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_emails.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own campaign emails"
  ON campaign_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_emails.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own campaign emails"
  ON campaign_emails
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_emails.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_emails.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own campaign emails"
  ON campaign_emails
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_emails.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_campaign_id ON campaign_templates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);