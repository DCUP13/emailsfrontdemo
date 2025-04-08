/*
  # Add Google SMTP Tables

  1. New Tables
    - `google_smtp_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `smtp_username` (text)
      - `app_password` (text)
      - `smtp_port` (text)
      - `smtp_server` (text)
      - Timestamps
    - `google_smtp_emails`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `address` (text)
      - `app_password` (text)
      - Timestamps

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create google_smtp_settings table
CREATE TABLE IF NOT EXISTS google_smtp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  smtp_username text NOT NULL,
  app_password text NOT NULL,
  smtp_port text NOT NULL,
  smtp_server text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create google_smtp_emails table
CREATE TABLE IF NOT EXISTS google_smtp_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  address text NOT NULL,
  app_password text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, address)
);

-- Enable RLS
ALTER TABLE google_smtp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_smtp_emails ENABLE ROW LEVEL SECURITY;

-- Policies for google_smtp_settings
CREATE POLICY "Users can read own SMTP settings"
  ON google_smtp_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SMTP settings"
  ON google_smtp_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SMTP settings"
  ON google_smtp_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own SMTP settings"
  ON google_smtp_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for google_smtp_emails
CREATE POLICY "Users can read own SMTP emails"
  ON google_smtp_emails
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SMTP emails"
  ON google_smtp_emails
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SMTP emails"
  ON google_smtp_emails
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own SMTP emails"
  ON google_smtp_emails
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);