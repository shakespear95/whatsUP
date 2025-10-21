// =====================================================
// Supabase Client Configuration
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// =====================================================
// Database Types
// =====================================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location: string;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price?: string;
  category: string;
  image_url?: string;
  ticket_link?: string;
  source?: string;
  is_verified?: boolean;
  real_event?: boolean;
  organizer?: string;
  capacity?: string;
  special_feature?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserSavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  notes?: string;
  saved_at: string;
}

export interface SearchHistory {
  id: string;
  user_id?: string;
  location: string;
  activity_type?: string;
  timeframe?: string;
  keywords?: string;
  budget?: string;
  radius?: number;
  results_count: number;
  cache_hit: boolean;
  searched_at: string;
}

export interface UserPreferences {
  user_id: string;
  default_location?: string;
  default_radius?: number;
  favorite_categories?: string[];
  email_notifications?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
  location?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Auth Helper Functions
// =====================================================

// Send OTP code to user's email
export async function sendEmailOTP(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error('Send OTP error:', error);
    throw error;
  }

  return data;
}

// Verify OTP code
export async function verifyEmailOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: 'email',
  });

  if (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }

  return data;
}

// Update user profile in auth metadata (for display name)
export async function updateUserMetadata(updates: {
  full_name?: string;
  avatar_url?: string;
}) {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });

  if (error) {
    console.error('Update metadata error:', error);
    throw error;
  }

  return data;
}

// Create or update user profile in database
export async function createUserProfile(profile: {
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
  location?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Authentication required');

  // First update auth metadata for display name
  await updateUserMetadata({ full_name: profile.full_name });

  // Then save full profile to database
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      ...profile,
    })
    .select()
    .single();

  if (error) {
    console.error('Create profile error:', error);
    throw error;
  }

  return data;
}

// Get user profile from database
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Get profile error:', error);
    throw error;
  }

  return data;
}

// Google OAuth (keeping for future use)
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Get user error:', error);
    return null;
  }

  return user;
}

// =====================================================
// Event API Functions
// =====================================================

export async function searchEvents(searchParams: {
  location: string;
  activity_type: string;
  timeframe: string;
  budget?: string;
  keywords?: string;
  radius?: number;
}) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Debug: Log session status
    if (!session?.access_token) {
      console.warn('⚠️ No valid session - searching as guest');
      throw new Error('Authentication required. Please sign in to search for events.');
    } else {
      console.log('✅ Valid session found, user:', session.user?.email);
    }

    // Create an AbortController with 5 minute timeout (for thorough search mode)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes (300 seconds)

    const response = await fetch(
      `${supabaseUrl}/functions/v1/search-events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify(searchParams),
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Search failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Search events error:', error);
    throw error;
  }
}

export async function saveEvent(eventId: string, notes?: string) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/save-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ event_id: eventId, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save event');
    }

    return await response.json();
  } catch (error) {
    console.error('Save event error:', error);
    throw error;
  }
}

export async function unsaveEvent(eventId: string) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/unsave-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ event_id: eventId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unsave event');
    }

    return await response.json();
  } catch (error) {
    console.error('Unsave event error:', error);
    throw error;
  }
}

export async function getMyEvents() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/my-events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabaseAnonKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get saved events');
    }

    return await response.json();
  } catch (error) {
    console.error('Get my events error:', error);
    throw error;
  }
}

// =====================================================
// Direct Database Queries (using RLS)
// =====================================================

// Alternative: Query user saved events directly (faster, bypasses Edge Function)
export async function getMyEventsDirect() {
  const { data, error } = await supabase
    .from('user_saved_events')
    .select(
      `
      id,
      saved_at,
      notes,
      events (*)
    `
    )
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Get saved events error:', error);
    throw error;
  }

  return data;
}

// Get user's search history
export async function getSearchHistory(limit = 10) {
  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .order('searched_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Get search history error:', error);
    throw error;
  }

  return data;
}

// Get user preferences
export async function getUserPreferences() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Get preferences error:', error);
    throw error;
  }

  return data;
}

// Update user preferences
export async function updateUserPreferences(preferences: Partial<UserPreferences>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Authentication required');

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
    })
    .select()
    .single();

  if (error) {
    console.error('Update preferences error:', error);
    throw error;
  }

  return data;
}
