# 🔍 Debugging Authentication Issues

## Quick Checks

### 1. Open Browser Console
Press **F12** or **Right-click > Inspect** > Go to **Console** tab

Look for any **red error messages**.

### 2. Common Issues & Solutions

#### Issue: "Code an E-Mail senden" button doesn't work

**Check:**
- Is the email field filled in?
- Any console errors?
- Is Email provider enabled in Supabase?

**Solution:**
```
Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
Make sure "Email" is toggled ON
```

#### Issue: Nothing happens when clicking buttons

**Possible causes:**
1. JavaScript error blocking execution
2. Email provider not enabled
3. Missing environment variables

**Debug in console:**
```javascript
// Test if Supabase is connected
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')

// Test sending OTP
const { data, error } = await window.supabase.auth.signInWithOtp({
  email: 'your.email@example.com'
})
console.log('OTP Result:', data, error)
```

#### Issue: Profile form doesn't appear

**Check:**
1. Did you verify the OTP code successfully?
2. Check console for errors during verification

### 3. Step-by-Step Test

**Test 1: Email Input**
1. Open settings
2. Type email in field
3. Does the button enable?
   - YES → Continue
   - NO → Email format issue

**Test 2: Send OTP**
1. Click "Code an E-Mail senden"
2. Do you see alert "Ein 6-stelliger Code wurde an Ihre E-Mail gesendet!"?
   - YES → Check email
   - NO → Check console for errors

**Test 3: Verify OTP**
1. Enter 6-digit code
2. Click "Code bestätigen"
3. Does profile form appear?
   - YES → Success!
   - NO → Check console for verification error

**Test 4: Complete Profile**
1. Fill in name (required)
2. Fill in optional fields
3. Click "Profil erstellen"
4. Does it save?
   - YES → Check Supabase dashboard
   - NO → Check console for save error

### 4. Verify Supabase Setup

**Email Provider:**
```
https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
```
- [ ] Email provider is ON
- [ ] "Enable Email Signup" is checked

**Tables:**
```
https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/editor
```
- [ ] `user_profiles` table exists
- [ ] `user_preferences` table exists
- [ ] `user_saved_events` table exists

**Environment Variables:**
Check `.env.local` file has:
```
VITE_SUPABASE_URL=https://ozezwaqtumofuybazkvo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 5. Test in Console

Open console and run:

```javascript
// Test 1: Check environment
console.log('ENV:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
})

// Test 2: Send OTP
async function testOTP() {
  const { data, error } = await window.supabase.auth.signInWithOtp({
    email: 'test@example.com'
  })
  console.log('OTP Test:', { data, error })
}
testOTP()

// Test 3: Check auth state
async function checkAuth() {
  const { data } = await window.supabase.auth.getSession()
  console.log('Current session:', data.session)
}
checkAuth()
```

### 6. Common Error Messages

**"provider is not enabled"**
- Email provider not enabled in Supabase
- Go to Supabase Auth Providers and enable Email

**"Missing Supabase environment variables"**
- Check `.env.local` file exists
- Restart dev server: `npm run dev`

**"Invalid OTP"**
- Code expired (5 min timeout)
- Wrong code entered
- Request new code

**"Failed to create profile"**
- `user_profiles` table doesn't exist
- Run migration SQL
- Check RLS policies

### 7. Reset and Try Again

If nothing works:

1. **Logout** (if logged in)
2. **Clear browser cache** (Ctrl+Shift+Del)
3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
4. **Hard refresh page** (Ctrl+F5)
5. **Try authentication again**

### 8. Get More Details

Tell me exactly:
1. **Which button** are you clicking?
2. **What happens** when you click it?
3. **Any error messages** in console?
4. **Screenshot** of console errors (if any)

Then I can help fix the specific issue!
