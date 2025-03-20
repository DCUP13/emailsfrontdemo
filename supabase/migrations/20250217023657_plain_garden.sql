/*
  # Add Rapid API Settings Table

  1. New Tables
    - `rapid_api_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `max_pages` (integer)
      - `api_key` (text)
      - `api_host` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `rapid_api_settings` table
    - Add policies for authenticated users to manage their own settings
*/

-- Create rapid_api_settings table
CREATE TABLE IF NOT EXISTS rapid_api_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_pages integer NOT NULL CHECK (max_pages > 0 AND max_pages <= 100),
  api_key text NOT NULL,
  api_host text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE rapid_api_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own Rapid API settings"
  ON rapid_api_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Rapid API settings"
  ON rapid_api_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Rapid API settings"
  ON rapid_api_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own Rapid API settings"
  ON rapid_api_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add documentation
COMMENT ON TABLE rapid_api_settings IS 'Stores Rapid API configuration for Zillow API access';
COMMENT ON COLUMN rapid_api_settings.max_pages IS 'Maximum number of pages to fetch from the API (1-100)';
COMMENT ON COLUMN rapid_api_settings.api_key IS 'RapidAPI key for authentication';
COMMENT ON COLUMN rapid_api_settings.api_host IS 'RapidAPI host for the Zillow API endpoint';