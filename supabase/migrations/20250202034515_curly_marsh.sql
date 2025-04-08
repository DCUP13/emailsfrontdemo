/*
  # Add templates table

  1. New Tables
    - `templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `name` (text)
      - `content` (text)
      - `format` (text)
      - `imported` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `templates` table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  content text NOT NULL,
  format text NOT NULL,
  imported boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own templates
CREATE POLICY "Users can read own templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to create their own templates
CREATE POLICY "Users can create own templates"
  ON templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own templates
CREATE POLICY "Users can update own templates"
  ON templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own templates
CREATE POLICY "Users can delete own templates"
  ON templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);