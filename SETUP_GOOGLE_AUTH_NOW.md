# 🚀 Set Up Google Authentication - Step by Step

## What You Need
- Google account
- 15 minutes
- Your Supabase project is already set up ✅

---

## Method 1: Quick Test (5 minutes) - START HERE

This lets you test immediately without creating Google credentials.

### Step 1: Go to Supabase Auth Settings

Open this link in your browser:
```
https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
```

### Step 2: Find Google Provider

Scroll down until you see "Google" in the list of providers.

### Step 3: Enable Google

1. Click on "Google" to expand it
2. You'll see a toggle switch - turn it **ON**
3. You'll see two options:
   - ☑️ **CHECK THIS BOX**: "Use Supabase's Google OAuth application for testing"
   - (This uses Supabase's test credentials so you can try it immediately)
4. Click **"Save"** at the bottom

### Step 4: Test It!

1. Go to your app: http://localhost:3000
2. Click the settings icon (⚙️)
3. Click "Mit Google anmelden"
4. Sign in with your Google account
5. You should be logged in! ✅

**That's it for testing!** Your authentication now works.

---

## Method 2: Production Setup (15 minutes)

For production (when you deploy), you need your own Google credentials.

### Part A: Create Google OAuth Credentials

#### Step 1: Go to Google Cloud Console

Open: https://console.cloud.google.com/

#### Step 2: Create a Project (if you don't have one)

1. Click the project dropdown at the top
2. Click "New Project"
3. Name it: "WhatsUP Events"
4. Click "Create"

#### Step 3: Configure OAuth Consent Screen

1. In the left menu, go to: **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: WhatsUP Events
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. Skip "Scopes" (click "Save and Continue")
7. Skip "Test users" (click "Save and Continue")
8. Click "Back to Dashboard"

#### Step 4: Create OAuth Client ID

1. In the left menu, go to: **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** (top of page)
3. Select **"OAuth client ID"**
4. Choose Application type: **"Web application"**
5. Name it: "WhatsUP Auth"

#### Step 5: Add Redirect URIs

In the "Authorized redirect URIs" section, click **"+ ADD URI"** and add this **EXACTLY**:

```
https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
```

**IMPORTANT**:
- Must start with `https://`
- No trailing slash at the end
- Copy/paste to avoid typos

#### Step 6: Save and Copy Credentials

1. Click **"CREATE"**
2. A popup appears with your credentials
3. **Copy the Client ID** - looks like: `123456789-abcdefgh.apps.googleusercontent.com`
4. **Copy the Client Secret** - looks like: `GOCSPX-abcdefgh...`
5. Keep these safe (you'll need them in the next step)

### Part B: Configure Supabase with Your Credentials

#### Step 1: Go to Supabase Auth Settings

Open: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers

#### Step 2: Configure Google Provider

1. Find "Google" in the list
2. Toggle it **ON**
3. **UNCHECK** "Use Supabase's Google OAuth application"
4. Paste your **Client ID** from Google
5. Paste your **Client Secret** from Google
6. Leave "Authorized Client IDs" empty
7. Leave "Skip nonce checks" unchecked

#### Step 3: Configure Site URLs

Scroll down to "URL Configuration" section:

**Site URL** (for production):
```
https://whats-up-git-test-shakespears-projects.vercel.app
```

**Additional Redirect URLs** - Add these:
```
http://localhost:3000/auth/callback
https://whats-up-git-test-shakespears-projects.vercel.app/auth/callback
```

#### Step 4: Save Everything

Click **"Save"** at the bottom of the page.

---

## Part C: Create Database Tables

### Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new

### Step 2: Copy the Migration

1. Open the file: `supabase/migrations/001_initial_schema.sql` (in your project)
2. Select ALL the text (Ctrl+A)
3. Copy it (Ctrl+C)

### Step 3: Run the Migration

1. Paste into the SQL Editor in Supabase (Ctrl+V)
2. Click **"Run"** button (bottom right)
3. Wait for "Success" message

### Step 4: Verify Tables Created

Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/editor

You should see these tables:
- ✅ events
- ✅ user_preferences
- ✅ user_saved_events
- ✅ search_history

---

## 🧪 Test Your Setup

### 1. Open Your App

Go to: http://localhost:3000

### 2. Open Browser Console

Press **F12** (or Right-click > Inspect > Console tab)

### 3. Run Diagnostics

Type this in the console:
```javascript
await window.authDebug.runDiagnostics()
```

You should see:
```
✅ Database Connected: ✅
❌ User Authenticated: ❌ (not logged in yet)
✅ Preferences Table Accessible: ✅
✅ Saved Events Table Accessible: ✅
```

### 4. Test Login

1. Click the **settings icon** (⚙️) in top right
2. Click **"Mit Google anmelden"**
3. Select your Google account
4. Grant permissions
5. You should be redirected back to your app

### 5. Verify Login

In the console, you should see:
```
🔐 Auth state changed: SIGNED_IN
✅ User logged in: {
  id: "uuid-here",
  email: "your.email@gmail.com",
  provider: "google"
}
```

### 6. Check Supabase Dashboard

Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users

You should see your user account with:
- ✅ Email
- ✅ Provider: google
- ✅ Created At timestamp

### 7. Run Diagnostics Again

In console:
```javascript
await window.authDebug.runDiagnostics()
```

Now everything should be green:
```
✅ Database Connected: ✅
✅ User Authenticated: ✅
✅ User in Database: ✅
✅ Preferences Table Accessible: ✅
✅ Saved Events Table Accessible: ✅
```

---

## 🎉 Success Checklist

After setup, you should be able to:

- ✅ Click "Mit Google anmelden" button
- ✅ Sign in with Google account
- ✅ See your profile in settings (avatar, name, email)
- ✅ User appears in Supabase Dashboard
- ✅ Console logs show "User logged in"
- ✅ No errors in browser console

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI in Google doesn't match Supabase.

**Fix**:
1. Go to Google Cloud Console > Credentials
2. Click your OAuth Client ID
3. Verify the redirect URI is **EXACTLY**:
   ```
   https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
   ```
4. No trailing slash, no typos
5. Save and try again

### Error: "Invalid client"

**Problem**: Client ID or Secret is wrong.

**Fix**:
1. Go back to Google Cloud Console > Credentials
2. Click your OAuth Client ID
3. Verify Client ID and Client Secret
4. Copy them again carefully
5. Paste into Supabase (Auth > Providers > Google)
6. Click Save

### Still showing "Unsupported provider"?

**Fix**:
1. Make sure you clicked **"Save"** in Supabase
2. Wait 10 seconds for settings to propagate
3. Refresh your app completely (Ctrl+F5)
4. Try again

### Login works but user not in database?

**Fix**:
1. Check if tables exist: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/editor
2. If tables missing, run the SQL migration again
3. User should appear in: Auth > Users (not in the tables directly)

### "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not configured.

**Fix**:
1. Go to Google Cloud Console
2. APIs & Services > OAuth consent screen
3. Fill in App name and Support email
4. Save and try again

---

## 📝 Summary

**Quickest way (5 min):**
1. Enable Google provider in Supabase
2. Check "Use Supabase's test credentials"
3. Run SQL migration for tables
4. Test login

**Production way (15 min):**
1. Create Google OAuth credentials
2. Configure Supabase with your credentials
3. Run SQL migration for tables
4. Test login

**Either way, your authentication will work!** 🚀

---

## 🔗 Quick Links

- **Supabase Auth Providers**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
- **Supabase SQL Editor**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new
- **Supabase Users**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users
- **Google Cloud Console**: https://console.cloud.google.com/
- **Google Credentials**: https://console.cloud.google.com/apis/credentials

---

## ❓ Need Help?

1. Check browser console for detailed errors
2. Run diagnostics: `await window.authDebug.runDiagnostics()`
3. Verify all URLs match exactly (no typos)
4. Try in incognito window to rule out cache issues

**Your code is ready - it just needs these credentials!** 🎉
