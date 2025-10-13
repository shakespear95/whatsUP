# Authentication Testing & Verification Guide

## Current Status

Your authentication code is **fully implemented and ready to test**! Here's what's been set up:

### ✅ Components Implemented
1. **Google OAuth Integration** - Complete authentication flow
2. **Auth Context & Hook** - Global authentication state management
3. **Settings Screen** - Dynamic UI showing user profile when logged in
4. **OAuth Callback Handler** - Proper redirect handling after Google login
5. **Enhanced Logging** - Detailed console logs for debugging
6. **Diagnostic Tools** - Built-in testing utilities

### 📋 Environment Configuration

Your Supabase is configured with:
- **Project URL**: `https://ozezwaqtumofuybazkvo.supabase.co`
- **Anon Key**: Configured in `.env.local`
- **Auth Provider**: Google OAuth (needs activation)

## Step 1: Verify Supabase Tables

Before testing authentication, ensure your Supabase database has these tables:

### Required Tables

```sql
-- 1. Users table (auto-created by Supabase Auth)
-- Located at: auth.users (managed by Supabase)

-- 2. User Preferences Table
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

-- RLS Policy: Users can only access their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- 3. User Saved Events Table
CREATE TABLE IF NOT EXISTS user_saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE user_saved_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own saved events
CREATE POLICY "Users can view own saved events"
  ON user_saved_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved events"
  ON user_saved_events FOR ALL
  USING (auth.uid() = user_id);

-- 4. Search History Table (Optional)
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

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own search history
CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
```

### How to Create Tables

1. **Go to Supabase SQL Editor**:
   - Visit: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new

2. **Paste the SQL above** and click "Run"

3. **Verify tables** in the Table Editor:
   - https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/editor

## Step 2: Configure Google OAuth

Follow the complete setup guide in `GOOGLE_AUTH_SETUP.md`:

### Quick Checklist
- [ ] Create Google Cloud Console project
- [ ] Enable Google+ API
- [ ] Create OAuth credentials (Client ID + Secret)
- [ ] Add redirect URI: `https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback`
- [ ] Enable Google provider in Supabase Dashboard
- [ ] Add Client ID and Client Secret to Supabase
- [ ] Configure site URLs in Supabase Auth settings

## Step 3: Test Authentication Flow

### 1. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 2. Open Browser Console

**Open DevTools** (F12 or Right-click > Inspect) and go to the **Console** tab

You should see:
```
🛠️ Auth debugging tools loaded! Use window.authDebug in console:
  - window.authDebug.testConnection()
  - window.authDebug.checkAuth()
  - window.authDebug.checkUserInDb()
  - window.authDebug.runDiagnostics()
```

### 3. Run Diagnostics

In the browser console, run:
```javascript
await window.authDebug.runDiagnostics()
```

This will test:
- ✅ Database connection
- ✅ Authentication state
- ✅ User in database
- ✅ Table accessibility

Expected output when **NOT logged in**:
```
📊 Diagnostic Results:
  - Database Connected: ✅
  - User Authenticated: ❌
  - User in Database: ❌
  - Preferences Table Accessible: ✅
  - Saved Events Table Accessible: ✅
```

### 4. Test Google Sign-In

1. **Click the settings icon** (⚙️) in the top navigation
2. **Click "Mit Google anmelden"** button
3. **You should be redirected to Google**
4. **Select your Google account**
5. **Grant permissions**
6. **You should be redirected back to the app**

### 5. Verify Authentication

After signing in, check the console. You should see:
```
🔐 Auth state changed: SIGNED_IN
✅ User logged in: {
  id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  email: "your.email@gmail.com",
  provider: "google"
}
```

### 6. Run Diagnostics Again

In the console:
```javascript
await window.authDebug.runDiagnostics()
```

Expected output when **logged in**:
```
📊 Diagnostic Results:
  - Database Connected: ✅
  - User Authenticated: ✅
  - User in Database: ✅
  - Preferences Table Accessible: ✅
  - Saved Events Table Accessible: ✅
```

### 7. Verify User in Database

Open Supabase Dashboard:
- Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users
- You should see your new user with:
  - Email
  - Provider: Google
  - Created At timestamp
  - Last Sign In timestamp

### 8. Test Settings Screen

In the settings modal, you should now see:
- **Your Google avatar**
- **Your name**
- **Your email**
- **"Ausloggen" (Logout) button**

### 9. Test Logout

1. Click **"Ausloggen"** button
2. Console should show:
   ```
   🔐 Auth state changed: SIGNED_OUT
   ℹ️ User logged out
   ```
3. Settings should show **"Mit Google anmelden"** button again

## Step 4: Verify Database Records

### Check User Record

Run in browser console:
```javascript
const { data: { user } } = await window.supabase.auth.getUser()
console.log('Current User:', user)
```

### Check User's Auth Identity

```javascript
const { data: { user } } = await window.supabase.auth.getUser()
console.log('Identities:', user?.identities)
```

This shows which providers the user has linked (should show "google").

### Check User Preferences

```javascript
const { data, error } = await window.supabase
  .from('user_preferences')
  .select('*')
console.log('Preferences:', data, error)
```

Initially this will be empty (no error, just empty array).

### Check Saved Events

```javascript
const { data, error } = await window.supabase
  .from('user_saved_events')
  .select('*')
console.log('Saved Events:', data, error)
```

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: Google redirect URI doesn't match Supabase

**Solution**:
1. Verify redirect URI in Google Cloud Console is exactly:
   ```
   https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
   ```
2. Check for typos, spaces, or extra characters

### Error: "Invalid client"

**Problem**: Client ID or Secret is wrong

**Solution**:
1. Double-check Client ID and Secret in Supabase Dashboard
2. Make sure you copied them correctly from Google Cloud Console
3. Try regenerating the OAuth credentials

### User Not Persisting After Redirect

**Problem**: User logs in but immediately logs out

**Solution**:
1. Check site URL in Supabase: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/url-configuration
2. Add your production URL: `https://whats-up-git-test-shakespears-projects.vercel.app`
3. Add localhost: `http://localhost:3000`

### Console Shows "Missing Supabase environment variables"

**Problem**: `.env.local` not loaded

**Solution**:
1. Verify `.env.local` exists in project root
2. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again
3. Check that variables start with `VITE_` prefix

### Tables Don't Exist

**Problem**: Database queries fail with "relation does not exist"

**Solution**:
1. Go to Supabase SQL Editor
2. Run the SQL from Step 1 above
3. Verify tables exist in Table Editor

### Authentication Works But Can't Query Tables

**Problem**: RLS policies blocking queries

**Solution**:
1. Verify RLS policies exist (see SQL above)
2. Make sure user is authenticated before querying
3. Check that policies use `auth.uid()` correctly

## What Happens When User Logs In

1. **User clicks "Mit Google anmelden"**
2. **Redirected to Google OAuth**
3. **User grants permissions**
4. **Google redirects to Supabase callback**: `https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback?code=...`
5. **Supabase validates the token**
6. **Supabase creates user record** in `auth.users` table (if new user)
7. **Supabase redirects to your app**: `http://localhost:3000/auth/callback`
8. **AuthCallback component** detects session and redirects to `/`
9. **AuthProvider** detects auth state change
10. **Console logs** show "User logged in"
11. **User object** is stored in React state
12. **UI updates** to show user profile in settings

## Next Steps After Authentication Works

Once authentication is working:

1. **Update favorite/save functionality** to persist to `user_saved_events`
2. **Create "Gespeicherte Events" page** to display saved events
3. **Add user preferences UI** to set default location, radius, etc.
4. **Enable search history** syncing across devices
5. **Add email notifications** for saved events (future feature)

## Support

If you encounter issues:

1. **Check browser console** for detailed error logs
2. **Run diagnostics**: `await window.authDebug.runDiagnostics()`
3. **Check Supabase logs**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/logs/explorer
4. **Verify all URLs** are correct (no typos)
5. **Test with different Google account** to rule out account-specific issues

## Summary

Your authentication system is **fully implemented** and ready to test. The main steps are:

1. ✅ Code is complete (no errors)
2. 📋 Create database tables (SQL above)
3. 🔧 Configure Google OAuth (see GOOGLE_AUTH_SETUP.md)
4. 🧪 Test authentication flow
5. 📊 Verify user in database
6. 🎉 Start using authenticated features

The diagnostic tools will help you identify any issues quickly. Good luck! 🚀
