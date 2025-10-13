# 🚀 Quick Start: Enable Google Authentication

Your app is showing the error: **"Unsupported provider: provider is not enabled"**

This means Google OAuth needs to be activated in Supabase. Here's how to fix it:

---

## ⚡ 5-Minute Setup

### Step 1: Enable Google Provider in Supabase (2 minutes)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers

2. **Find Google Provider:**
   - Scroll down to "Google" in the providers list
   - Click to expand it

3. **Enable Google:**
   - Toggle "Enable Sign in with Google" to **ON**
   - You'll see it requires Client ID and Client Secret
   - Don't close this page yet!

---

### Step 2: Get Google OAuth Credentials (3 minutes)

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Create a project or select existing one

2. **Create OAuth Credentials:**
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - If prompted, configure OAuth consent screen first (just fill in app name)
   - Choose **"Web application"**
   - Give it a name like "WhatsUP Events"

3. **Add Authorized Redirect URI:**
   Copy and paste this EXACTLY:
   ```
   https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
   ```

   For local development, also add:
   ```
   http://localhost:3000/auth/callback
   ```

4. **Save and Copy Credentials:**
   - Click **"CREATE"**
   - Copy the **Client ID** (looks like: `123456789-abc...googleusercontent.com`)
   - Copy the **Client Secret** (looks like: `GOCSPX-...`)

---

### Step 3: Configure Supabase (1 minute)

1. **Go back to Supabase Dashboard:**
   - You should still have the Google provider page open
   - If not, go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers

2. **Paste Credentials:**
   - Paste **Client ID** from Google
   - Paste **Client Secret** from Google
   - Skip "Authorized Client IDs" (not needed)

3. **Set Site URL (IMPORTANT):**
   - Scroll to bottom of page
   - Under "URL Configuration", set:
     - **Site URL**: `https://whats-up-git-test-shakespears-projects.vercel.app`
     - **Redirect URLs**: Add both:
       - `https://whats-up-git-test-shakespears-projects.vercel.app/auth/callback`
       - `http://localhost:3000/auth/callback`

4. **Save Changes:**
   - Click **"Save"** at the bottom

---

## ✅ Test It!

1. **Refresh your app** (Ctrl+R or Cmd+R)
2. **Click settings icon** (⚙️ in top right)
3. **Click "Mit Google anmelden"**
4. **Sign in with Google**
5. **You should see your profile!** 🎉

---

## 🚨 Troubleshooting

### Still getting "provider is not enabled"?
- Make sure you clicked **"Save"** in Supabase
- Try refreshing the Supabase dashboard and check Google is toggled ON
- Wait 10 seconds and try again (settings take a moment to propagate)

### "redirect_uri_mismatch" error?
- Check the redirect URI in Google Console **exactly** matches:
  `https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback`
- NO trailing slashes
- Make sure it's under "Authorized redirect URIs" section

### Can't find credentials page in Google?
- Make sure you're in the right project in Google Cloud Console
- Enable "Google+ API" first (APIs & Services → Library → search "Google+")

---

## 📝 What Happens After Setup?

Once configured, your users can:
- ✅ Sign in with one click
- ✅ See their profile in settings
- ✅ Save favorite events (when you connect that feature)
- ✅ Sync data across devices
- ✅ Sign out securely

---

## 🔗 Quick Links

- **Supabase Auth Settings**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Full Setup Guide**: See `GOOGLE_AUTH_SETUP.md` for detailed instructions

---

## 💡 Need Help?

If you get stuck:
1. Check browser console (F12) for detailed error messages
2. Verify all URLs are typed correctly (no typos!)
3. Make sure you're logged into the correct Google/Supabase accounts
4. Try in an incognito window to rule out cache issues

The authentication is already coded and ready - it just needs these credentials to work! 🚀
