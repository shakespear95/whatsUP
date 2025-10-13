# 📧 Email OTP Authentication - Setup Guide

## ✅ What's Been Implemented

Your app now has **Email OTP (One-Time Password) authentication** with user profile collection!

### How It Works:

1. **User enters email** → Gets 6-digit code sent to their email
2. **User enters code** → Verifies they own the email
3. **New users** → Asked to enter their name
4. **Returning users** → Logged in immediately
5. **User profile** → Name and email saved to database

---

## 🚀 Quick Setup (2 Minutes)

### Step 1: Enable Email Auth in Supabase

1. **Go to Supabase Auth Providers:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
   ```

2. **Find "Email" provider**

3. **Toggle it ON**

4. **Make sure these are checked:**
   - ✅ Enable Email Signup
   - ✅ Enable Email OTP (if available)

5. **Click "Save"**

### Step 2: Create Database Tables

1. **Go to Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new
   ```

2. **Copy all SQL** from `supabase/migrations/001_initial_schema.sql`

3. **Paste and click "Run"**

4. **Verify tables** in Table Editor

---

## 🎨 User Flow

### For New Users:

```
1. User opens settings
2. Clicks in email field
3. Enters: their.email@example.com
4. Clicks "Code an E-Mail senden"
5. Receives email with 6-digit code (e.g., 123456)
6. Enters the code
7. Asked to enter their name
8. Enters: "Max Mustermann"
9. Clicks "Profil erstellen"
10. Logged in! ✅
```

### For Returning Users:

```
1. User opens settings
2. Enters their email
3. Clicks "Code an E-Mail senden"
4. Enters 6-digit code from email
5. Logged in immediately! ✅ (No need to re-enter name)
```

---

## 📊 What Gets Saved

### In Supabase Auth (auth.users):

```json
{
  "id": "uuid-xxxx-xxxx",
  "email": "user@example.com",
  "email_confirmed_at": "2025-10-13...",
  "user_metadata": {
    "full_name": "Max Mustermann"
  },
  "created_at": "2025-10-13...",
  "last_sign_in_at": "2025-10-13..."
}
```

### User Can Later Save:

- **Favorite events** → `user_saved_events` table
- **Preferences** → `user_preferences` table (location, radius, categories)
- **Search history** → `search_history` table

---

## 🧪 Test It Now

### 1. Open Your App

Go to: http://localhost:3000

### 2. Open Settings

Click the settings icon (⚙️) in the top navigation

### 3. Enter Your Email

Type a real email address you can access

### 4. Click "Code an E-Mail senden"

You should see: "Ein 6-stelliger Code wurde an Ihre E-Mail gesendet!"

### 5. Check Your Email

Look for an email from **noreply@mail.app.supabase.io**

Subject: "Confirm Your Signup" or "Your Login Code"

The email will contain a **6-digit code** like: `123456`

### 6. Enter the Code

Type the 6 digits in the app

Click "Code bestätigen"

### 7. Enter Your Name (First Time Only)

If you're a new user, enter your name

Click "Profil erstellen"

### 8. You're Logged In! ✅

You should see:
- Your name in the settings profile card
- Your email address
- "Ausloggen" (Logout) button

---

## ✅ Verify User in Database

### Check Supabase Dashboard

1. **Go to Auth Users:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users
   ```

2. **You should see:**
   - Your email
   - Email Confirmed: ✅
   - Created At timestamp
   - Last Sign In timestamp

3. **Click on your user** to see metadata:
   ```json
   {
     "full_name": "Your Name"
   }
   ```

### Check in Browser Console

```javascript
// Check current user
const { data: { user } } = await window.supabase.auth.getUser()
console.log('User:', user)

// Should show:
// {
//   email: "your.email@example.com",
//   user_metadata: { full_name: "Your Name" }
// }
```

---

## 🔐 Security Features

### What Makes This Secure:

✅ **No Passwords** - No passwords to remember or leak
✅ **Email Verification** - Only email owner can log in
✅ **Time-Limited Codes** - OTP expires after 5 minutes
✅ **One-Time Use** - Each code can only be used once
✅ **Encrypted** - All data encrypted in transit and at rest

---

## 💡 Email Configuration (Optional)

### Default Email Settings:

Supabase sends emails from: `noreply@mail.app.supabase.io`

### Custom Email Domain (Production):

You can configure custom email templates and sender:

1. Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/templates
2. Customize email templates
3. Add custom SMTP (optional)

---

## 🎯 Features

### Current Features:

✅ **Email OTP Authentication** - Passwordless login
✅ **Profile Collection** - Collects user's name
✅ **Automatic Login** - Returning users skip profile setup
✅ **Session Persistence** - Users stay logged in
✅ **Logout** - Secure sign out

### What You Can Add Next:

1. **Save Events** - Let users favorite events
2. **User Preferences** - Default location, radius, categories
3. **Search History** - Track user searches
4. **Email Notifications** - Notify about saved events

---

## 🐛 Troubleshooting

### Not Receiving Email?

**Check Spam/Junk folder** - Supabase emails sometimes go there

**Wait 1-2 minutes** - Email can take time to arrive

**Try different email** - Some providers block automated emails

**Check Supabase Logs:**
```
https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/logs/explorer
```

### Invalid Code Error?

**Check code carefully** - Make sure you entered all 6 digits

**Code expired** - Request a new code (expires after 5 minutes)

**Already used** - Each code can only be used once

### Email Not Enabled?

Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers

Make sure "Email" provider is **toggled ON**

---

## 📱 User Experience

### Why Users Love This:

✅ **No Password** - Nothing to remember
✅ **Fast** - Login in seconds
✅ **Secure** - Only email owner can access
✅ **Modern** - Like Slack, WhatsApp Web, etc.
✅ **Universal** - Everyone has email

### Compared to Google OAuth:

| Feature | Email OTP | Google OAuth |
|---------|-----------|--------------|
| Setup Time | 2 min | 15 min |
| User Convenience | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| External Dependencies | None | Google Account |
| Privacy | High | Shares with Google |
| Works in China | ✅ | ❌ |

---

## 🎉 Success Checklist

After setup, you should be able to:

- [ ] Enter email in settings
- [ ] Receive 6-digit code via email
- [ ] Enter code and verify
- [ ] Enter name (first time only)
- [ ] See profile in settings
- [ ] User appears in Supabase Dashboard
- [ ] Logout and login again
- [ ] Login skips name entry (returning user)

---

## 📊 What's Next

Once authentication works:

### 1. Enable Save Events

Update EventCard to save events to database:

```typescript
const handleSaveEvent = async () => {
  if (!user) {
    alert('Please login to save events');
    return;
  }

  await saveEvent(event.id);
  alert('Event saved!');
};
```

### 2. Show Saved Events

Create a "Gespeicherte Events" page:

```typescript
const savedEvents = await getMyEventsDirect();
```

### 3. Add User Preferences

Let users set default location, radius, categories:

```typescript
await updateUserPreferences({
  default_location: 'Zürich',
  default_radius: 10,
  favorite_categories: ['Konzerte', 'Sport']
});
```

---

## 🚀 Summary

**What You Have:**
- ✅ Complete Email OTP authentication
- ✅ User profile collection (name)
- ✅ Session management
- ✅ Database integration ready

**What You Need:**
1. Enable Email provider in Supabase (2 minutes)
2. Create database tables (2 minutes)
3. Test authentication flow

**That's it!** No Google OAuth, no API keys, no complex setup. Just enable Email in Supabase and you're ready to go! 🎉

---

## 🔗 Quick Links

- **Supabase Auth Providers**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
- **Supabase SQL Editor**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/sql/new
- **Supabase Users**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/users
- **Email Templates**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/templates
- **Supabase Logs**: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/logs/explorer

---

**Ready to test? Open http://localhost:3000 and try it now!** 📧✨
