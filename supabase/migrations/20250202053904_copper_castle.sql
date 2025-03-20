/*
  # Add Amazon SES Configuration Tables

  1. New Tables
    - `amazon_ses_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `smtp_username` (text)
      - `smtp_password` (text)
      - `smtp_port` (text)
      - `smtp_server` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `amazon_ses_emails`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create amazon_ses_settings table
CREATE TABLE IF NOT EXISTS amazon_ses_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  smtp_username text NOT NULL,
  smtp_password text NOT NULL,
  smtp_port text NOT NULL,
  smtp_server text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create amazon_ses_emails table
CREATE TABLE IF NOT EXISTS amazon_ses_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, address)
);

-- Enable RLS
ALTER TABLE amazon_ses_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE amazon_ses_emails ENABLE ROW LEVEL SECURITY;

-- Policies for amazon_ses_settings
CREATE POLICY "Users can read own SES settings"
  ON amazon_ses_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SES settings"
  ON amazon_ses_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SES settings"
  ON amazon_ses_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own SES settings"
  ON amazon_ses_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for amazon_ses_emails
CREATE POLICY "Users can read own SES emails"
  ON amazon_ses_emails
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SES emails"
  ON amazon_ses_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SES emails"
  ON amazon_ses_emails
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own SES emails"
  ON amazon_ses_emails
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);