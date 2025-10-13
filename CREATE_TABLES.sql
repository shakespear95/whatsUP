-- =====================================================
-- WhatsUP Event Finder - Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. EVENTS TABLE (Main event data)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  venue TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  ticket_link TEXT,
  source TEXT,
  is_verified BOOLEAN DEFAULT false,
  real_event BOOLEAN DEFAULT false,
  organizer TEXT,
  capacity TEXT,
  special_feature TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_location_idx ON events(location);
CREATE INDEX IF NOT EXISTS events_category_idx ON events(category);

-- Enable RLS (optional - events can be public)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view events)
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

-- Only authenticated users can insert/update (optional)
CREATE POLICY "Authenticated users can manage events"
  ON events FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 2. USER PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_location TEXT,
  default_radius INTEGER DEFAULT 10,
  favorite_categories TEXT[],
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. USER SAVED EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_saved_events_user_idx ON user_saved_events(user_id);
CREATE INDEX IF NOT EXISTS user_saved_events_event_idx ON user_saved_events(event_id);

-- Enable RLS
ALTER TABLE user_saved_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own saved events
CREATE POLICY "Users can view own saved events"
  ON user_saved_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved events"
  ON user_saved_events FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. SEARCH HISTORY TABLE (Optional)
-- =====================================================

CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  activity_type TEXT,
  timeframe TEXT,
  keywords TEXT,
  budget TEXT,
  radius INTEGER,
  results_count INTEGER DEFAULT 0,
  cache_hit BOOLEAN DEFAULT false,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS search_history_user_idx ON search_history(user_id);
CREATE INDEX IF NOT EXISTS search_history_searched_at_idx ON search_history(searched_at DESC);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Users can view own search history, anonymous searches are allowed
CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create search history"
  ON search_history FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for events table
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences table
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant access to anonymous users (for public events)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON events TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('events', 'user_preferences', 'user_saved_events', 'search_history')
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- DONE! Tables created successfully.
-- =====================================================
