# WhatsUP Authentication - Quick Reference Guide

## 🎯 What Was Implemented

Google OAuth authentication has been fully integrated into your WhatsUP app using Supabase Auth. Users can now sign in with their Google account to save events and sync preferences.

## 📁 Files Created/Modified

### New Files:
1. **`src/hooks/useAuth.tsx`** - Authentication context and hook
2. **`src/pages/AuthCallback.tsx`** - OAuth callback handler
3. **`GOOGLE_AUTH_SETUP.md`** - Complete setup guide
4. **`AUTHENTICATION_GUIDE.md`** - This file

### Modified Files:
1. **`src/components/SettingsScreen.tsx`** - Added login/logout UI
2. **`src/main.tsx`** - Wrapped app with AuthProvider
3. **`src/App.tsx`** - Added callback route handling
4. **`CLAUDE.md`** - Updated project documentation

## 🔧 How It Works

### Authentication Flow:
```
User clicks "Mit Google anmelden"
         ↓
Redirects to Google OAuth
         ↓
User authorizes the app
         ↓
Google redirects to /auth/callback
         ↓
Supabase creates session
         ↓
User redirected to home page
         ↓
Profile appears in settings
```

### Using Authentication in Your Code:

```typescript
import { useAuth } from '../hooks/useAuth';

function YourComponent() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  // Check if user is logged in
  if (user) {
    console.log('User is logged in:', user.email);
  }

  // Sign in
  const handleLogin = async () => {
    await signInWithGoogle();
  };

  // Sign out
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <p>Welcome, {user.user_metadata?.full_name}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
}
```

## 🔐 User Object Properties

When a user is logged in, you have access to:

```typescript
user.id                           // Unique user ID (UUID)
user.email                        // User's email
user.user_metadata.full_name      // User's full name
user.user_metadata.avatar_url     // Profile picture URL
user.user_metadata.email          // Email (also in metadata)
user.created_at                   // Account creation date
```

## 🗄️ Database Integration

### Saving Events for Logged-In Users:

```typescript
import { saveEvent, unsaveEvent } from '../lib/supabase';

// Save an event
await saveEvent(eventId, 'Optional note');

// Remove saved event
await unsaveEvent(eventId);

// Get user's saved events
import { getMyEvents } from '../lib/supabase';
const myEvents = await getMyEvents();
```

### Direct Database Queries (with RLS):

```typescript
import { supabase } from '../lib/supabase';

// Save event directly (automatic user filtering via RLS)
const { data, error } = await supabase
  .from('user_saved_events')
  .insert({
    event_id: eventId,
    notes: 'My note'
  });

// Get user's saved events (automatic filtering)
const { data, error } = await supabase
  .from('user_saved_events')
  .select('*, events(*)')
  .order('saved_at', { ascending: false });
```

## ⚙️ Configuration Required

Before authentication works in production, you need to:

### 1. Google Cloud Console Setup:
- Create OAuth 2.0 credentials
- Add authorized redirect URI: `https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback`
- Get Client ID and Client Secret

### 2. Supabase Dashboard Setup:
- Go to Authentication → Providers → Google
- Enable Google provider
- Paste Client ID and Client Secret
- Set Site URL: `https://whats-up-git-test-shakespears-projects.vercel.app`
- Add Redirect URLs

**See `GOOGLE_AUTH_SETUP.md` for detailed instructions.**

## 🧪 Testing Authentication

### Local Development:
```bash
npm run dev
```
1. Click settings icon (⚙️)
2. Click "Mit Google anmelden"
3. Sign in with Google
4. Check console for user object
5. Verify profile appears in settings

### Production:
Deploy to Vercel and follow same steps

## 🚨 Troubleshooting

### "redirect_uri_mismatch"
- Check redirect URI in Google Console exactly matches Supabase callback URL
- Should be: `https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback`

### User doesn't persist after redirect
- Verify Site URL in Supabase settings
- Check that redirect URL matches your domain
- Clear browser cookies and try again

### "Invalid client" error
- Double-check Client ID and Client Secret in Supabase
- Ensure Google+ API is enabled in Google Console

## 📱 Current UI Features

### Settings Screen (Logged Out):
- Profile icon placeholder
- "Nicht angemeldet" text
- "Mit Google anmelden" button

### Settings Screen (Logged In):
- User avatar (or icon if no avatar)
- User's full name
- User's email address
- Red "Ausloggen" button at bottom

## 🎯 Next Features to Implement

1. **Persistent Favorites**: Update heart icon to save to database
2. **My Events Page**: Show saved events from `user_saved_events` table
3. **User Preferences**: Save default location, radius, categories
4. **Search History**: Track and display past searches
5. **Email Notifications**: Notify users about saved events

## 📊 Database Schema

Your Supabase has these tables ready:

### `user_saved_events`
- `id` - UUID primary key
- `user_id` - References auth.users
- `event_id` - Event identifier
- `notes` - Optional user notes
- `saved_at` - Timestamp

### `user_preferences`
- `user_id` - References auth.users (primary key)
- `default_location` - User's preferred location
- `default_radius` - Search radius preference
- `favorite_categories` - Array of preferred categories
- `email_notifications` - Boolean

### `search_history`
- `id` - UUID primary key
- `user_id` - References auth.users (nullable)
- `location` - Search location
- `activity_type` - Category searched
- `timeframe` - Time period
- `keywords` - Search keywords
- `results_count` - Number of results
- `searched_at` - Timestamp

All tables have Row Level Security (RLS) enabled, so users can only access their own data.

## 🔗 Useful Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo
- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

## 💡 Tips

1. **Always check `loading` state** before accessing `user` object
2. **Use try/catch** when calling auth functions
3. **Check `user` existence** before accessing nested properties
4. **RLS policies** automatically filter queries by user ID
5. **Session persists** in localStorage automatically

## 🎉 Summary

You now have a fully functional Google OAuth authentication system! Users can:
- ✅ Sign in with Google
- ✅ View their profile in settings
- ✅ Sign out securely
- ✅ Have session persist across page loads
- ✅ Access user-specific database tables (once implemented)

The authentication is production-ready and just needs Google Cloud Console configuration to go live.
