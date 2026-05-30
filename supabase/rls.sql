-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Grant table-level permissions
GRANT SELECT ON articles TO anon;
GRANT SELECT, INSERT, DELETE ON favorites TO anon;
GRANT ALL ON articles TO service_role;
GRANT ALL ON favorites TO service_role;


-- Articles: anyone can read, only service role can insert/update/delete
CREATE POLICY "Articles are publicly readable"
  ON articles FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage articles"
  ON articles FOR ALL
  USING (auth.role() = 'service_role');

-- Favorites: anyone can read/insert/delete (single-user app)
CREATE POLICY "Favorites are publicly readable"
  ON favorites FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert favorites"
  ON favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete favorites"
  ON favorites FOR DELETE
  USING (true);
