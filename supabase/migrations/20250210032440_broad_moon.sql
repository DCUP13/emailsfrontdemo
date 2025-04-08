-- Enable realtime for templates table
DO $$ 
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'templates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE templates;
  END IF;
END $$;

-- Drop existing realtime policy if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE policyname = 'Enable realtime for all authenticated users'
    AND tablename = 'templates'
  ) THEN
    DROP POLICY "Enable realtime for all authenticated users" ON templates;
  END IF;
END $$;

-- Create realtime policy
CREATE POLICY "Enable realtime for all authenticated users"
  ON templates
  FOR SELECT
  TO authenticated
  USING (true);