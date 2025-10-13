# 🚨 Fix: "Unsupported provider: provider is not enabled"

## The Error You're Seeing

```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

**What this means**: Google OAuth is not enabled in your Supabase project.

---

## ✅ Quick Fix (15 minutes total)

### Part 1: Enable Google in Supabase (5 min)

You need to configure Google OAuth in Supabase. There are **TWO ways** to do this:

#### Option A: Use Temporary Google Credentials (Quick Test - 5 min)

1. **Go to Supabase Auth Settings:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
   ```

2. **Find "Google" provider** (scroll down)

3. **Enable it and use these temporary test credentials:**
   - Toggle "Enable Sign in with Google" to **ON**
   - **IMPORTANT**: Check the box "Use Supabase's Google OAuth application (for testing only)"
   - This allows you to test immediately without creating Google credentials
   - Click **Save**

4. **Test it now!**
   - Refresh your app: http://localhost:3000
   - Click settings → "Mit Google anmelden"
   - Should work immediately!

**Note**: This is for testing only. For production, use Option B.

---

#### Option B: Use Your Own Google Credentials (Production - 10 min)

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Create OAuth Client ID:**
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External
     - App name: "WhatsUP Events"
     - User support email: Your email
     - Click "Save and Continue" through the steps

3. **Configure OAuth Client:**
   - Application type: **Web application**
   - Name: "WhatsUP Events Auth"
   - **Authorized redirect URIs** - Add this EXACTLY:
     ```
     https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
     ```
   - For local testing, also add:
     ```
     http://localhost:3000/auth/callback
     ```
   - Click **CREATE**

4. **Copy Your Credentials:**
   - Copy the **Client ID** (looks like: `123456-abcdef...googleusercontent.com`)
   - Copy the **Client Secret** (looks like: `GOCSPX-...`)

5. **Configure Supabase:**
   - Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
   - Find "Google" provider
   - Toggle to **ON**
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - **Uncheck** "Use Supabase's Google OAuth application"
   - Click **Save**

6. **Configure Site URLs:**
   - Scroll down to "URL Configuration"
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Add both:
     - `http://localhost:3000/auth/callback`
     - `https://whats-up-git-test-shakespears-projects.vercel.app/auth/callback`
   - Click **Save**

---

### Part 2: Create Database Tables (5 min)

1. **Go to Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new
   ```

2. **Copy the entire contents** of `supabase/migrations/001_initial_schema.sql`

3. **Paste into SQL Editor** and click **"Run"**

4. **Verify tables created:**
   - Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/editor
   - You should see:
     - `events`
     - `user_preferences`
     - `user_saved_events`
     - `search_history`

---

## ✅ Test Authentication

1. **Refresh your app:**
   ```
   http://localhost:3000
   ```

2. **Open browser console** (F12 → Console)

3. **Run diagnostics:**
   ```javascript
   await window.authDebug.runDiagnostics()
   ```

4. **Click settings icon** (⚙️)

5. **Click "Mit Google anmelden"**

6. **Sign in with Google**

7. **Verify success:**
   - Console shows: "✅ User logged in"
   - Settings shows your profile picture, name, and email
   - Supabase shows user: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users

---

## 🎯 What You Should See

### Before Fix
```
❌ Error: "Unsupported provider: provider is not enabled"
```

### After Fix
```
✅ User logged in: {
  id: "uuid-here",
  email: "your.email@gmail.com",
  provider: "google"
}
```

---

## 🐛 Troubleshooting

### Still getting "provider is not enabled"?
- Clear browser cache and try again
- Wait 10 seconds (settings take time to propagate)
- Verify you clicked **"Save"** in Supabase
- Check that toggle is **ON** for Google provider

### "redirect_uri_mismatch" error?
- Verify the redirect URI in Google Console is **exactly**:
  ```
  https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
  ```
- No trailing slash, no typos
- Make sure it's https:// not http://

### "Invalid client" error?
- Double-check Client ID and Secret in Supabase
- Make sure you copied them correctly from Google
- Try regenerating credentials in Google Console

### Tables error "relation does not exist"?
- Run the SQL migration in Supabase SQL Editor
- Verify tables exist in Table Editor

---

## 📊 Check User in Database

After logging in, verify the user was created:

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users
   ```

2. **You should see your user with:**
   - ✅ Email address
   - ✅ Provider: google
   - ✅ Created At timestamp
   - ✅ Last Sign In timestamp

3. **Run in browser console:**
   ```javascript
   // Check current user
   const { data: { user } } = await window.supabase.auth.getUser()
   console.log('Current user:', user)

   // Check user preferences (should be empty initially)
   const { data } = await window.supabase.from('user_preferences').select('*')
   console.log('Preferences:', data)
   ```

---

## 🚀 After Authentication Works

Once you can log in:

1. **User data is automatically created** in `auth.users` table
2. **User can save events** to `user_saved_events` table
3. **User preferences** can be stored in `user_preferences` table
4. **Search history** tracked in `search_history` table
5. **All data syncs** across devices when logged in

---

## 💡 Quick Links

- **Supabase Auth Providers**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Supabase SQL Editor**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new
- **Supabase Users List**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users

---

## ✅ Summary

**The error happens because Google OAuth needs to be enabled in Supabase.**

**Fastest fix:**
1. Enable Google provider in Supabase (use test credentials)
2. Run database migration SQL
3. Test authentication

**That's it!** Your authentication code is perfect - it just needs these credentials to work. 🚀
