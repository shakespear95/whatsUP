# 📊 User Data Flow - What Happens After Google Login

## 🔐 Automatic User Table Population

When a user signs in with Google OAuth, Supabase **automatically** creates a record in the `auth.users` table. You don't need to do anything - it happens automatically!

---

## 🗄️ Database Tables Involved

### 1. `auth.users` (Managed by Supabase)
**Automatically created when user logs in**

This is Supabase's internal authentication table. When a user signs in with Google:

```sql
-- Supabase automatically inserts:
INSERT INTO auth.users (
    id,                    -- UUID (unique user ID)
    email,                 -- user@gmail.com
    email_confirmed_at,    -- Timestamp
    encrypted_password,    -- NULL (using OAuth)
    raw_app_meta_data,     -- Provider info
    raw_user_meta_data,    -- Google profile data
    created_at,
    updated_at,
    last_sign_in_at
) VALUES (...);
```

**User metadata includes:**
```json
{
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "email": "user@gmail.com",
  "email_verified": true,
  "full_name": "John Doe",
  "iss": "https://accounts.google.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "provider_id": "1234567890",
  "sub": "1234567890"
}
```

---

### 2. `user_saved_events` (Your Custom Table)
**You create records when user saves an event**

```sql
-- Your app inserts when user clicks "save/favorite":
INSERT INTO user_saved_events (
    user_id,      -- Automatically set to auth.uid()
    event_id,     -- Event they're saving
    notes         -- Optional notes
);
```

**Example:**
```typescript
// In your code:
import { saveEvent } from './lib/supabase';

// When user clicks heart icon:
await saveEvent(eventId, 'Want to go with friends!');
```

---

### 3. `user_preferences` (Your Custom Table)
**You create/update when user changes settings**

```sql
-- Your app inserts/updates user preferences:
INSERT INTO user_preferences (
    user_id,               -- Automatically set to auth.uid()
    default_location,      -- 'Zürich'
    default_radius,        -- 50
    favorite_categories,   -- ['konzerte', 'sport']
    email_notifications    -- true
)
ON CONFLICT (user_id) DO UPDATE SET
    default_location = EXCLUDED.default_location,
    ...;
```

**Example:**
```typescript
// In your code:
import { updateUserPreferences } from './lib/supabase';

// When user updates settings:
await updateUserPreferences({
    default_location: 'Zürich',
    default_radius: 50,
    favorite_categories: ['konzerte', 'sport']
});
```

---

### 4. `search_history` (Your Custom Table)
**Automatically tracked when user searches**

```sql
-- Your app can insert after each search:
INSERT INTO search_history (
    user_id,           -- NULL if not logged in, auth.uid() if logged in
    location,          -- 'Zürich'
    activity_type,     -- 'konzerte'
    timeframe,         -- 'thisWeek'
    results_count      -- 15
);
```

---

## 🔄 Complete User Login Flow

```
User clicks "Mit Google anmelden"
         ↓
Redirects to Google OAuth
         ↓
User authorizes app
         ↓
Google sends user data to Supabase
         ↓
Supabase AUTOMATICALLY creates/updates record in auth.users
         ↓
Supabase generates JWT session token
         ↓
User redirected to /auth/callback
         ↓
Your app receives session
         ↓
useAuth() hook updates with user data
         ↓
User profile appears in settings!
```

---

## 🔍 How to View User Data in Supabase

### View All Logged-In Users:

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users

2. **You'll see:**
   - List of all users who have signed in
   - Email addresses
   - Sign-in method (Google)
   - Last sign-in time
   - User ID (UUID)

### View User Details:

Click on any user to see:
- **User ID**: `a1b2c3d4-e5f6-7890-1234-567890abcdef`
- **Email**: `user@gmail.com`
- **Provider**: Google
- **User Metadata**: Full name, avatar URL, etc.
- **App Metadata**: Provider info

### Query Users from SQL Editor:

```sql
-- View all users (requires service_role key)
SELECT id, email, raw_user_meta_data->>'full_name' as name, created_at
FROM auth.users
ORDER BY created_at DESC;

-- View user's saved events
SELECT u.email, e.title, use.saved_at
FROM user_saved_events use
JOIN auth.users u ON u.id = use.user_id
JOIN events e ON e.id = use.event_id;

-- View user preferences
SELECT u.email, up.default_location, up.favorite_categories
FROM user_preferences up
JOIN auth.users u ON u.id = up.user_id;
```

---

## 🔐 Row Level Security (RLS) Protection

Your tables are protected by RLS policies:

### `user_saved_events`
```sql
-- Users can ONLY see their own saved events
CREATE POLICY "Users can view their own saved events"
    ON user_saved_events FOR SELECT
    USING (auth.uid() = user_id);
```

This means:
- User A can only query their own saved events
- User B cannot see User A's saved events
- Automatic filtering based on `auth.uid()`

### Example Query:
```typescript
// User is automatically filtered
const { data } = await supabase
    .from('user_saved_events')
    .select('*');
// Returns ONLY current user's saved events!
```

---

## 📝 What You Need to Implement

Supabase handles authentication automatically, but YOU need to:

### ✅ Already Done:
- `auth.users` table (managed by Supabase) ✅
- User authentication (handled by Supabase) ✅
- Session management (handled by useAuth hook) ✅

### 🚧 Still To Do:
1. **Connect Favorite/Heart Button to Database:**
   ```typescript
   // When user clicks heart icon:
   const handleToggleFavorite = async (eventId: string) => {
       if (isFavorite(eventId)) {
           await unsaveEvent(eventId);
       } else {
           await saveEvent(eventId);
       }
   };
   ```

2. **Create "Gespeicherte Events" Page:**
   ```typescript
   // Show user's saved events:
   const { data: savedEvents } = await getMyEventsDirect();
   ```

3. **Save User Preferences (Optional):**
   ```typescript
   // When user updates settings:
   await updateUserPreferences({
       default_location: 'Zürich',
       default_radius: 50
   });
   ```

4. **Track Search History (Optional):**
   ```typescript
   // After search:
   await supabase.from('search_history').insert({
       location: searchLocation,
       results_count: results.length
   });
   ```

---

## 🎯 Summary

**Automatic (Supabase handles):**
- ✅ Creating `auth.users` record on Google login
- ✅ Storing user email, name, avatar
- ✅ Managing sessions and tokens
- ✅ Row Level Security filtering

**Manual (You implement):**
- 🚧 Inserting records into `user_saved_events`
- 🚧 Creating/updating `user_preferences`
- 🚧 Tracking `search_history`
- 🚧 Building UI to display saved events

The authentication is working - now you just need to connect your app features to save user data! 🚀

---

## 🔗 Useful Queries

### Check if user has saved an event:
```typescript
const { data } = await supabase
    .from('user_saved_events')
    .select('id')
    .eq('event_id', eventId)
    .single();

const isSaved = !!data;
```

### Get user's saved events with full details:
```typescript
const { data } = await supabase
    .from('user_saved_events')
    .select(`
        id,
        saved_at,
        notes,
        events (*)
    `)
    .order('saved_at', { ascending: false });
```

### Get current user info:
```typescript
const { user } = useAuth();

console.log(user.id);                        // UUID
console.log(user.email);                     // email@example.com
console.log(user.user_metadata.full_name);   // Full Name
console.log(user.user_metadata.avatar_url);  // Profile picture
```

The user data is already flowing into `auth.users` - you just need to start using it! 🎉
