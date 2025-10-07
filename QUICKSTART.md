# 🚀 Quick Start Guide - WhatsUP with Supabase

This guide will get you up and running in **15 minutes**.

## ✅ Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account created (https://supabase.com)
- [ ] Code editor (VS Code recommended)

---

## 📦 Step 1: Install Dependencies (2 minutes)

```bash
cd D:\virtual\whatsUP

# Install project dependencies
npm install

# Install Supabase CLI globally
npm install -g supabase
```

---

## 🗄️ Step 2: Set Up Supabase Project (5 minutes)

### Create Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: `whatsup-events`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
4. Click "Create Project" (takes ~2 minutes)

### Create Database Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New Query"
3. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Verify: Go to **Table Editor** → should see 4 tables:
   - `events`
   - `user_saved_events`
   - `search_history`
   - `user_preferences`

---

## 🔑 Step 3: Configure Environment Variables (3 minutes)

### Get Supabase Credentials

1. In Supabase Dashboard: **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...`

### Create `.env.local` File

```bash
# Create file in project root
cp .env.local.example .env.local
```

### Edit `.env.local` with your values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key
```

---

## ⚡ Step 4: Deploy Edge Functions (5 minutes)

```bash
# Login to Supabase
supabase login

# Link your project (get project ref from dashboard URL)
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy search-events
supabase functions deploy save-event
supabase functions deploy unsave-event
supabase functions deploy my-events
```

### Set API Keys (Optional - for real event search)

```bash
# Set your API keys for LLM search
supabase secrets set OPENAI_API_KEY=sk-...your-key
supabase secrets set SERP_API_KEY=your-serpapi-key
supabase secrets set PERPLEXITY_API_KEY=pplx-...your-key
supabase secrets set GOOGLE_AI_API_KEY=your-gemini-key
```

**Note**: The app works without these keys (uses mock data). Add them later for real event search.

---

## 🎉 Step 5: Run Your App!

```bash
# Start development server
npm run dev
```

**Open**: http://localhost:3000

### Test Basic Features:

1. ✅ **Search Events** (works with mock data)
2. ✅ **View Events** on map/list
3. ⚠️ **Save Events** (requires authentication)

---

## 🔐 Step 6: Enable Google Sign-In (Optional - 10 minutes)

### Quick Setup:

1. **Google Cloud Console**: https://console.cloud.google.com
2. **Create OAuth Client**:
   - Type: Web application
   - Authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
3. **Copy Client ID & Secret**
4. **Supabase Dashboard**: **Authentication** → **Providers** → **Google**
   - Paste Client ID & Secret
   - Enable Google provider
5. **Update `.env.local`**:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

**Full Guide**: See `SUPABASE_SETUP.md` for detailed steps.

---

## 🧪 Quick Tests

### Test 1: Search Works

```bash
# Open browser DevTools Console
# Run search, check Network tab
# Should see POST to /functions/v1/search-events
```

### Test 2: Database Connection

```bash
# In Supabase Dashboard → SQL Editor
SELECT COUNT(*) FROM events;
# Should return number > 0 (sample events)
```

### Test 3: Authentication (if Google OAuth enabled)

1. Click "Sign In with Google"
2. Complete auth flow
3. Check Supabase Dashboard → **Authentication** → **Users**
4. Should see your account

---

## 🚨 Common Issues & Fixes

### Issue 1: "Missing Supabase environment variables"

**Fix**: Check `.env.local` exists and has correct values
```bash
# Verify file exists
cat .env.local

# Restart dev server
npm run dev
```

### Issue 2: Edge Functions not found (404)

**Fix**: Deploy functions
```bash
supabase link --project-ref your-ref
supabase functions deploy
```

### Issue 3: Search returns no results

**Check**:
- Edge functions deployed? `supabase functions list`
- API keys set? `supabase secrets list`
- Database has events? Run query in SQL Editor

**Temporary Fix**: Mock data fallback is automatic

### Issue 4: CORS errors

**Fix**: Redeploy functions with correct CORS headers
```bash
supabase functions deploy search-events
```

---

## 📱 Next Steps

### For Development:

1. ✅ Update frontend components to use Supabase client
2. ✅ Implement "Save Event" button functionality
3. ✅ Add "My Saved Events" page
4. ✅ Get API keys for real event search

### For Production:

1. ✅ Deploy to Vercel
2. ✅ Update Supabase Auth URLs to production domain
3. ✅ Add environment variables in Vercel
4. ✅ Enable Google OAuth with production redirect URIs

---

## 📚 Full Documentation

- **Complete Setup**: `SUPABASE_SETUP.md`
- **Project Architecture**: `CLAUDE.md`
- **Database Schema**: `supabase/migrations/001_initial_schema.sql`

---

## 🎯 Success Criteria

You're ready to code when:

- ✅ App runs on http://localhost:3000
- ✅ Search returns events (mock or real)
- ✅ Database tables exist in Supabase
- ✅ Edge Functions deployed
- ✅ No console errors

**Time to build!** 🚀

---

## 🆘 Still Stuck?

1. Check Supabase Dashboard → **Logs** for errors
2. Check browser console for client-side errors
3. Run `supabase status` to verify local setup
4. See `SUPABASE_SETUP.md` for detailed troubleshooting

**Happy coding!** 🎉
