# Supabase Email OTP Redirect Fix

## Problem
Email verification links are pointing to `http://localhost:3000` instead of the production website.

## Root Cause
The Supabase project's **Site URL** is currently set to localhost instead of the production Vercel URL.

## Solution

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select project: **ozezwaqtumofuybazkvo** (whatsup-events)

### Step 2: Update Site URL
1. Navigate to: **Authentication** → **URL Configuration**
2. Find **Site URL** field
3. Change from: `http://localhost:3000`
4. Change to: `https://whats-up-blond.vercel.app`
5. Click **Save**

### Step 3: Update Redirect URLs
In the same **URL Configuration** section, under **Redirect URLs**:

Add these URLs (one per line):
```
https://whats-up-blond.vercel.app/**
https://whats-up-blond.vercel.app/auth/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
```

**IMPORTANT**: Remove any old URLs containing "git-test" or "shakespears-projects"

**Note**: Keep localhost URLs for local development testing.

### Step 4: Verify Email Template
Your current email template is correct:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

The `{{ .ConfirmationURL }}` variable automatically uses the **Site URL** you configured in Step 2.

## Testing After Fix

1. **Clear browser cache** (or use incognito mode)
2. Go to: https://whats-up-blond.vercel.app
3. Click the **settings icon** (top right)
4. Click **"Anmelden"** (Login)
5. Enter your email address
6. Click **"Code senden"** (Send Code)
7. Check your email inbox
8. Verify the link now points to: `https://whats-up-blond.vercel.app/auth/callback?token=...`
9. Click the link and verify you're redirected to the production website
10. **No Vercel login should be required**

## Expected Behavior

✅ Email links should point to production URL
✅ Users can authenticate from any device
✅ OAuth callback handling works correctly
✅ No code changes needed - purely configuration

## Troubleshooting

**If links still point to localhost:**
- Clear your browser cache completely
- Wait 1-2 minutes after saving Supabase settings
- Try requesting a new OTP code (old emails still have old URLs)
- Verify you clicked "Save" in Supabase Dashboard

**If you get "Invalid redirect URL" error:**
- Verify you added the production URL to **Redirect URLs** list
- Ensure URLs don't have trailing slashes (except for wildcard `/**`)
- Check for typos in the URL

## Additional Resources

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- URL Configuration Guide: https://supabase.com/docs/guides/auth/redirect-urls

## Quick Access Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo
- **Auth Settings**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/url-configuration
- **Production Website**: https://whats-up-blond.vercel.app
