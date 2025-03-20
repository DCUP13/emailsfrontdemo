/*
  # User Settings Table

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `notifications` (boolean)
      - `dark_mode` (boolean)
      - `two_factor_auth` (boolean)
      - `newsletter` (boolean)
      - `public_profile` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for authenticated users to:
      - Read their own settings
      - Insert their own settings
      - Update their own settings
      - Delete their own settings

  3. Automation
    - Add function to create default settings for new users
    - Add trigger to automatically create settings when a profile is created
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notifications boolean DEFAULT true,
  dark_mode boolean DEFAULT false,
  two_factor_auth boolean DEFAULT false,
  newsletter boolean DEFAULT false,
  public_profile boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings on user creation
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_settings();