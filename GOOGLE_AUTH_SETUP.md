# Google Authentication Setup Guide

## Overview
This guide will help you set up Google OAuth authentication for your WhatsUP event finder app using Supabase.

## Prerequisites
- Supabase account with a project created
- Google Cloud Console account

## Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
     ```
   - For local testing, also add:
     ```
     http://localhost:5173/auth/callback
     ```

4. **Save Your Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**

## Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo
   - Navigate to "Authentication" > "Providers"

2. **Enable Google Provider**
   - Find "Google" in the list
   - Toggle it to "Enabled"
   - Paste your **Client ID** from Google Cloud Console
   - Paste your **Client Secret** from Google Cloud Console
   - Click "Save"

3. **Configure Redirect URLs**
   - Go to "Authentication" > "URL Configuration"
   - Add your site URL: `https://whats-up-git-test-shakespears-projects.vercel.app`
   - Add redirect URLs:
     - `https://whats-up-git-test-shakespears-projects.vercel.app/auth/callback`
     - `http://localhost:5173/auth/callback` (for local development)

## Step 3: Update Environment Variables (Optional)

If you want to use Google Client ID in your frontend (for custom button styling), add to `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Step 4: Test Authentication

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the login flow:**
   - Click the settings icon (⚙️)
   - Click "Mit Google anmelden"
   - You should be redirected to Google login
   - After login, you should be redirected back to your app

3. **Test the logout flow:**
   - In settings, click "Ausloggen"
   - You should be logged out and see the login button again

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL
- URL should be: `https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback`

### User not persisting after redirect
- Check that your site URL is configured correctly in Supabase
- Verify the redirect URL in `src/lib/supabase.ts` matches your production URL

### "Invalid client" error
- Double-check your Client ID and Client Secret in Supabase
- Make sure Google+ API is enabled in Google Cloud Console

## Features Enabled After Setup

Once configured, users can:
- ✅ Sign in with Google
- ✅ View their profile in settings
- ✅ Save favorite events (requires user login)
- ✅ Sync data across devices
- ✅ Sign out securely

## Database Integration

The authentication is already integrated with your Supabase tables:
- `user_saved_events` - Saved/favorite events
- `user_preferences` - User settings and preferences
- `search_history` - Search history (optional authentication)

All tables use Row Level Security (RLS) policies that automatically filter data based on the authenticated user.

## Next Steps

After authentication is working, you can:
1. Update the favorite/save event functionality to persist to database
2. Enable search history syncing across devices
3. Add user preferences (default location, radius, etc.)
4. Implement email notifications for saved events

## Support

If you encounter issues:
1. Check Supabase logs: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/logs
2. Check browser console for errors
3. Verify all URLs are correct (no typos in redirect URIs)
