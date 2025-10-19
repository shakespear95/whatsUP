# 🔐 Authentication Debug Guide

## Problem
**Searches are blocked with:**
```
❌ Unauthenticated search attempt blocked
```

**But you're logged in!** You can see your account in the UI.

---

## 🔍 What's Happening

This issue started **after deploying new Edge Functions**. There are two possibilities:

### **Possibility 1: Session Expired**
- You logged in earlier
- The JWT token has expired (default: 1 hour)
- Frontend still shows you as "logged in" (from cached user object)
- But the actual session token is expired

### **Possibility 2: Session Not Being Retrieved**
- `getSession()` is returning `null`
- Even though `getUser()` returns a user
- Token isn't being sent to Edge Function

---

## 🧪 **Diagnostic Steps**

### **Step 1: Check Browser Console**

1. Open your app: https://whats-up-git-test-shakespears-projects.vercel.app
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Try to search

**What You Should See:**

**If session is valid:**
```
✅ Valid session found, user: your@email.com
```
→ Token is being sent, but Edge Function might have issue

**If session is invalid/expired:**
```
⚠️ No valid session - searching as guest
Error: Authentication required. Please sign in to search for events.
```
→ Token expired, need to log in again

---

### **Step 2: Check Auth State on Mount**

Look in the console when the page first loads. You should see:

**If authenticated:**
```
✅ User authenticated on mount: {
  id: "...",
  email: "your@email.com",
  provider: "email" or "google"
}
```

**If not authenticated:**
```
ℹ️ No user authenticated on mount
```

---

### **Step 3: Check Session vs User**

Open console and run:
```javascript
// Check user
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Check session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Token expired?', session?.expires_at ? new Date(session.expires_at * 1000) < new Date() : 'No session');
```

**Possible Results:**

| User | Session | Meaning |
|------|---------|---------|
| ✅ exists | ✅ exists | Fully authenticated |
| ✅ exists | ❌ null | **Session expired!** Need to login again |
| ❌ null | ❌ null | Not logged in |

---

## 🔧 **Quick Fixes**

### **Fix 1: Log Out and Log Back In**

**If session expired:**
1. Click settings/profile in app
2. Click "Abmelden" (Logout)
3. Wait for page to refresh
4. Log in again (email or Google)
5. Try searching

This will create a fresh JWT token.

---

### **Fix 2: Refresh Session Programmatically**

If you keep getting logged out, add session refresh:

**Add to `src/lib/supabase.ts` before the search:**
```typescript
// Try to refresh session if expired
const { data: { session }, error } = await supabase.auth.refreshSession();
if (error || !session) {
  throw new Error('Session expired. Please log in again.');
}
```

---

### **Fix 3: Increase Session Duration**

**In Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/policies
2. Click **"Configuration"**
3. Find **"JWT Expiry"**
4. Change from `3600` (1 hour) to `86400` (24 hours)
5. Save

---

## 🐛 **Common Issues**

### **Issue 1: "I just logged in but searches still fail"**

**Cause:** Old session cached in browser
**Fix:** Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

---

### **Issue 2: "Works for 1 hour then breaks"**

**Cause:** JWT token expires after 1 hour (default)
**Fix:** Either:
- Log in again every hour
- Increase JWT expiry (see Fix 3 above)
- Add automatic session refresh

---

### **Issue 3: "Logs say 'Valid session' but Edge Function still blocks"**

**Cause:** Edge Function not receiving the token correctly
**Debug:**
1. Open Edge Function logs
2. Look for the search request
3. Check if `user_id` shows your ID or "guest"

**If showing "guest" despite valid session:**
→ Token isn't reaching the Edge Function
→ Check CORS headers or Authorization header format

---

## 📊 **Expected Flow (Working State)**

```
1. User logs in → JWT token created (expires in 1hr)
2. Token stored in Supabase client
3. User searches → getSession() returns valid session
4. Frontend logs: "✅ Valid session found"
5. API call includes: Authorization: Bearer eyJhbGc...
6. Edge Function receives token
7. Edge Function validates token → user object
8. Search proceeds
```

---

## 🔍 **Debug Checklist**

Run through this checklist:

- [ ] Open browser console before searching
- [ ] Check for "✅ Valid session found" log
- [ ] If "⚠️ No valid session" → Log out and back in
- [ ] Try search again
- [ ] Check Edge Function logs for user_id
- [ ] Verify user_id is YOUR ID (not "guest")

---

## 📝 **What to Share**

If still having issues, share:

1. **Browser console logs** when you try to search
2. **Edge Function logs** from Supabase dashboard
3. **Auth state** from running the Session vs User check above

This will show exactly where the auth is breaking!

---

## 🚀 **Quick Test**

**Run this in browser console:**
```javascript
// Test auth status
const test = async () => {
  console.log('=== AUTH STATUS TEST ===');

  const { data: { user } } = await supabase.auth.getUser();
  console.log('1. User:', user ? `✅ ${user.email}` : '❌ Not logged in');

  const { data: { session } } = await supabase.auth.getSession();
  console.log('2. Session:', session ? '✅ Valid' : '❌ Expired/Missing');

  if (session) {
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const minutesLeft = Math.floor((expiresAt - now) / 1000 / 60);
    console.log(`3. Token expires in: ${minutesLeft} minutes`);
    console.log(`4. Token valid: ${expiresAt > now ? '✅ Yes' : '❌ EXPIRED'}`);
  }

  console.log('=== END TEST ===');
};

test();
```

**Expected output if working:**
```
=== AUTH STATUS TEST ===
1. User: ✅ your@email.com
2. Session: ✅ Valid
3. Token expires in: 45 minutes
4. Token valid: ✅ Yes
=== END TEST ===
```

**If broken:**
```
1. User: ✅ your@email.com  ← You're "logged in"
2. Session: ❌ Expired/Missing  ← But session is gone!
```

---

**Created:** 2025-01-19
**Status:** 🔍 Diagnostic Tool
**Next:** Run the test and share results!
