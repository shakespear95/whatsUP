-- =====================================================
-- WhatsUP Event Finder - Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location features (optional, for advanced geo queries)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- Table 1: events (Global event catalog)
-- =====================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic event info
    title TEXT NOT NULL,
    description TEXT,

    -- Date and time
    date DATE NOT NULL,
    time TIME,

    -- Location details
    location TEXT NOT NULL,
    venue TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Event details
    price TEXT,
    category TEXT NOT NULL,
    image_url TEXT,
    ticket_link TEXT,

    -- Metadata
    source TEXT, -- 'SerpAPI', 'Perplexity', 'AI Generated', etc.
    is_verified BOOLEAN DEFAULT false,
    real_event BOOLEAN DEFAULT false, -- from real search vs AI generated

    -- Additional info
    organizer TEXT,
    capacity TEXT,
    special_feature TEXT,
    tags TEXT[], -- Array of tags

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexes for fast searching
    CONSTRAINT events_title_date_venue_unique UNIQUE(title, date, venue)
);

-- Create indexes for common queries
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_location_category ON events(location, category);

-- =====================================================
-- Table 2: user_saved_events (User bookmarks)
-- =====================================================
CREATE TABLE user_saved_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

    -- Optional user notes
    notes TEXT,

    -- Timestamp
    saved_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate saves
    CONSTRAINT user_saved_events_unique UNIQUE(user_id, event_id)
);

-- Create indexes
CREATE INDEX idx_user_saved_events_user_id ON user_saved_events(user_id);
CREATE INDEX idx_user_saved_events_event_id ON user_saved_events(event_id);

-- =====================================================
-- Table 3: search_history (Track user searches)
-- =====================================================
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Search parameters
    location TEXT NOT NULL,
    activity_type TEXT,
    timeframe TEXT,
    keywords TEXT,
    budget TEXT,
    radius INTEGER,

    -- Results metadata
    results_count INTEGER DEFAULT 0,
    cache_hit BOOLEAN DEFAULT false, -- Was result from cache?

    -- Timestamp
    searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at DESC);

-- =====================================================
-- Table 4: user_preferences (User settings)
-- =====================================================
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Preferences
    default_location TEXT,
    default_radius INTEGER DEFAULT 50,
    favorite_categories TEXT[], -- Array of preferred categories
    email_notifications BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Events: Public read, authenticated write
CREATE POLICY "Events are viewable by everyone"
    ON events FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert events"
    ON events FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events"
    ON events FOR UPDATE
    USING (auth.role() = 'authenticated');

-- User saved events: Users can only see their own
CREATE POLICY "Users can view their own saved events"
    ON user_saved_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved events"
    ON user_saved_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved events"
    ON user_saved_events FOR DELETE
    USING (auth.uid() = user_id);

-- Search history: Users can only see their own
CREATE POLICY "Users can view their own search history"
    ON search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
    ON search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User preferences: Users can only manage their own
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- Functions and Triggers
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
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences table
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Useful Views
-- =====================================================

-- View: User's saved events with full event details
CREATE OR REPLACE VIEW user_saved_events_details AS
SELECT
    use.id as saved_id,
    use.user_id,
    use.saved_at,
    use.notes,
    e.*
FROM user_saved_events use
JOIN events e ON use.event_id = e.id;

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Insert some sample events for testing
INSERT INTO events (title, description, date, time, location, venue, address, price, category, source, image_url) VALUES
('Zurich Jazz Night', 'Live jazz performance featuring local and international artists', '2025-10-15', '20:00', 'Zurich', 'Moods Jazz Club', 'Schiffbaustrasse 6, 8005 Zürich', '35-50 CHF', 'Concerts & Party', 'Manual', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'),
('Digital Art Exhibition', 'Immersive digital art experience showcasing Swiss artists', '2025-10-20', '14:00', 'Zurich', 'Kunsthaus Zürich', 'Heimplatz 1, 8001 Zürich', 'Free', 'Art & Museums', 'Manual', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'),
('Tech Startup Meetup', 'Networking event for tech entrepreneurs and developers', '2025-10-12', '18:30', 'Zurich', 'Google Office Zurich', 'Brandschenkestrasse 110, 8002 Zürich', 'Free', 'Knowledge & Business', 'Manual', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800');

COMMENT ON TABLE events IS 'Global catalog of all events discovered through search or AI generation';
COMMENT ON TABLE user_saved_events IS 'User bookmarks and saved events for personalized collections';
COMMENT ON TABLE search_history IS 'Tracks all user searches for analytics and recommendations';
COMMENT ON TABLE user_preferences IS 'User-specific settings and preferences';
