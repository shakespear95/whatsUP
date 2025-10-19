# Fix: Google OAuth Provider Not Enabled

## Error Message
```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

## Problem
Google OAuth provider is not enabled in your Supabase project.

---

## 🔧 Quick Fix (5 minutes)

### Step 1: Go to Supabase Auth Settings

**Direct Link:**
```
https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
```

Or navigate:
1. Go to Supabase Dashboard
2. Select your project: `whatsUP`
3. Click **"Authentication"** in left sidebar
4. Click **"Providers"** tab

---

### Step 2: Enable Google Provider

1. **Find Google in the list** of providers
2. **Click on "Google"** to expand settings
3. **Toggle "Enable Sign in with Google"** to ON
4. You'll need:
   - ✅ Google Client ID
   - ✅ Google Client Secret

---

### Step 3: Get Google OAuth Credentials

#### Option A: Already Have Credentials?
If you created them before, find them at:
- https://console.cloud.google.com/apis/credentials

#### Option B: Create New Credentials

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Create OAuth Client ID:**
   - Click **"+ CREATE CREDENTIALS"**
   - Select **"OAuth client ID"**
   - Application type: **"Web application"**
   - Name: `WhatsUP Event Finder`

3. **Add Authorized Redirect URIs:**
   ```
   https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
   ```

   **IMPORTANT:** Use your exact Supabase URL!

4. **Click CREATE**
   - Copy **Client ID**
   - Copy **Client Secret**

---

### Step 4: Configure in Supabase

1. Back in Supabase Auth Providers → Google
2. **Paste credentials:**
   - **Client ID (for OAuth):** `paste-your-client-id`
   - **Client Secret (for OAuth):** `paste-your-client-secret`

3. **Authorized Client IDs** (optional):
   - Leave empty for now
   - Only needed for mobile apps

4. **Skip PKCE flow:** Leave unchecked

5. **Click "Save"**

---

### Step 5: Configure Site URL

Still in Supabase Auth settings:

1. Click **"URL Configuration"** (in left menu under Authentication)

2. **Site URL:** Set to your production URL
   ```
   https://whats-up-git-test-shakespears-projects.vercel.app
   ```

3. **Redirect URLs:** Add these (one per line):
   ```
   https://whats-up-git-test-shakespears-projects.vercel.app/**
   http://localhost:3000/**
   http://localhost:5173/**
   ```

4. **Click "Save"**

---

## 🧪 Test the Fix

### Test 1: Check Provider Status
```bash
# Via browser, go to:
https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers

# Google should show:
✅ Enabled
```

### Test 2: Try Login
1. Open your app (logged out)
2. Click "Mit Google anmelden"
3. Should open Google OAuth popup (not error)
4. Select Google account
5. Should redirect back and be logged in

### Test 3: Check Session
```javascript
// In browser console
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);

// Should show user object with email
```

---

## 🚨 Still Getting Errors?

### Error: "redirect_uri_mismatch"
**Fix:** Add this exact URI to Google Console:
```
https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback
```

### Error: "Invalid client"
**Fix:**
1. Check Client ID and Secret are correct
2. Copy-paste again (no extra spaces)
3. Wait 1-2 minutes for Google to propagate

### Error: "Access blocked"
**Fix:**
1. In Google Cloud Console
2. OAuth Consent Screen
3. Add test users (your email)
4. Or publish app (for production)

---

## 📋 Complete Setup Checklist

- [ ] Google Cloud project created
- [ ] OAuth Client ID created
- [ ] Redirect URI added: `https://ozezwaqtumofuybazkvo.supabase.co/auth/v1/callback`
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Google provider enabled in Supabase
- [ ] Client ID pasted in Supabase
- [ ] Client Secret pasted in Supabase
- [ ] Saved in Supabase
- [ ] Site URL configured
- [ ] Redirect URLs added
- [ ] Tested login flow

---

## 🎯 Quick Video Guide

If you prefer visual instructions:
1. **Supabase Docs:** https://supabase.com/docs/guides/auth/social-login/auth-google
2. **Video Tutorial:** Search "Supabase Google OAuth setup" on YouTube

---

## 🔄 Alternative: Use Email Login Instead

If Google OAuth is too complex right now, use email magic links:

### Enable Email Provider:
1. In Supabase → Auth → Providers
2. Enable **"Email"**
3. Turn on **"Enable email confirmations"**

### Update Frontend:
```typescript
// In AdvancedStartScreen.tsx
// Replace signInWithGoogle() with:

const [email, setEmail] = useState('');

const handleEmailLogin = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  if (error) {
    alert('Error: ' + error.message);
  } else {
    alert('Check your email for login link!');
  }
};

// In UI:
<Input
  type="email"
  placeholder="deine@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
<Button onClick={handleEmailLogin}>
  Mit Email anmelden
</Button>
```

---

## 📞 Need More Help?

### Supabase Support:
- **Discord:** https://discord.supabase.com
- **Docs:** https://supabase.com/docs/guides/auth/social-login/auth-google
- **GitHub Issues:** https://github.com/supabase/supabase/issues

### Google OAuth Issues:
- **Console:** https://console.cloud.google.com
- **Support:** https://support.google.com/cloud

---

## 🎨 Visual Reference

### What Google Cloud Console Should Look Like:
```
OAuth 2.0 Client IDs
┌────────────────────────────────────────┐
│ WhatsUP Event Finder                   │
│ Type: Web application                  │
│                                        │
│ Client ID: 123456789-abc....          │
│ Client Secret: GOCSPX-xyz...          │
│                                        │
│ Authorized redirect URIs:              │
│ https://ozezwaqtumofuybazkvo...       │
└────────────────────────────────────────┘
```

### What Supabase Auth Should Look Like:
```
Providers
┌────────────────────────────────────────┐
│ Google                          ✅ ON  │
│ ────────────────────────────────────   │
│ Client ID: 123456789-abc....          │
│ Client Secret: ●●●●●●●●●●●●●●        │
│                                        │
│ [Save]                                 │
└────────────────────────────────────────┘
```

---

## 🚀 After Fixing

Once Google OAuth is enabled:

1. **Refresh your app**
2. **Click "Mit Google anmelden"**
3. **Should work!** ✅

Then you can search for events!

---

**Last Updated:** 2025-01-15
**Status:** 🔧 Troubleshooting Guide
