# Supabase Setup Guide for WhatsUP Event Finder

This guide walks you through setting up Supabase for the WhatsUP Event Finder application.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- A Supabase account (free tier available at https://supabase.com)

## 🚀 Step 1: Create Supabase Project

1. **Go to https://supabase.com and sign up/login**

2. **Create a new project:**
   - Click "New Project"
   - Choose organization or create one
   - Enter project details:
     - Name: `whatsup-events` (or your preferred name)
     - Database Password: Generate a strong password (save it!)
     - Region: Choose closest to your users
     - Pricing Plan: Free (sufficient for development)

3. **Wait for project creation** (takes ~2 minutes)

4. **Copy your project credentials:**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` (looks like: `https://xxxxx.supabase.co`)
     - `anon/public` key (starts with `eyJ...`)
     - `service_role` key (starts with `eyJ...`) - **Keep this secret!**

---

## 🗄️ Step 2: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Click "SQL Editor" in the left sidebar**
3. **Create a new query**
4. **Copy and paste the entire contents** of `supabase/migrations/001_initial_schema.sql`
5. **Click "Run"**
6. **Verify tables were created:**
   - Go to "Table Editor" → You should see:
     - `events`
     - `user_saved_events`
     - `search_history`
     - `user_preferences`

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (use project reference ID from dashboard)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## 🔐 Step 3: Set Up Google OAuth

### 3.1 Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com

2. **Create a new project (or use existing):**
   - Click project dropdown → "New Project"
   - Name: `WhatsUP Events`

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure consent screen (if prompted):
     - User Type: External
     - App name: WhatsUP Event Finder
     - User support email: your email
     - Developer contact: your email
   - Application type: **Web application**
   - Name: `WhatsUP Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://your-vercel-domain.vercel.app
     ```
   - Authorized redirect URIs:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     http://localhost:54321/auth/v1/callback
     ```
   - Click "Create"
   - **Copy Client ID and Client Secret**

### 3.2 Configure Supabase

1. **Go to Supabase Dashboard**
2. **Navigate to Authentication → Providers**
3. **Enable Google provider:**
   - Toggle "Google" to ON
   - Paste **Client ID**
   - Paste **Client Secret**
   - Click "Save"

4. **Configure Auth Settings:**
   - Go to Authentication → URL Configuration
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: Add:
     ```
     http://localhost:3000
     https://your-vercel-domain.vercel.app
     ```

---

## ⚡ Step 4: Deploy Supabase Edge Functions

### 4.1 Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 4.2 Login and Link Project

```bash
# Login
supabase login

# Link to your project
cd D:\virtual\whatsUP
supabase link --project-ref your-project-ref
```

### 4.3 Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy search-events
supabase functions deploy save-event
supabase functions deploy unsave-event
supabase functions deploy my-events

# Or deploy all at once
supabase functions deploy
```

### 4.4 Set Environment Secrets for Edge Functions

```bash
# Set API keys (replace with your actual keys)
supabase secrets set SERP_API_KEY=your-serpapi-key-here
supabase secrets set PERPLEXITY_API_KEY=your-perplexity-key-here
supabase secrets set OPENAI_API_KEY=your-openai-key-here
supabase secrets set GOOGLE_AI_API_KEY=your-gemini-key-here

# Verify secrets
supabase secrets list
```

---

## 🔑 Step 5: Get API Keys for LLM Search

### SerpAPI (Real Event Search)
1. Go to https://serpapi.com
2. Sign up for free account (100 searches/month free)
3. Copy API key from dashboard

### Perplexity AI (Real Event Search)
1. Go to https://www.perplexity.ai/settings/api
2. Sign up and get API key
3. Free tier: 5 requests/day

### OpenAI (Fallback AI Generation)
1. Go to https://platform.openai.com
2. Create API key
3. Add credits ($5 minimum)

### Google AI (Gemini - Fallback)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key (free tier available)

---

## 🌐 Step 6: Update Frontend Environment Variables

Create `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth (for frontend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**Important:**
- Use `VITE_` prefix for Vite apps
- Never commit `.env.local` to Git
- Add `.env.local` to `.gitignore`

---

## 🧪 Step 7: Test Your Setup

### Test Database Connection

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
   ```sql
   SELECT * FROM events LIMIT 5;
   ```
3. You should see sample events

### Test Edge Functions Locally

```bash
# Start local Supabase
supabase start

# Test search-events function
curl -X POST http://localhost:54321/functions/v1/search-events \
  -H "Content-Type: application/json" \
  -d '{"location":"Zurich","activity_type":"Concerts & Party","timeframe":"this week"}'
```

### Test Authentication

1. **Start your frontend:**
   ```bash
   npm run dev
   ```

2. **Click "Sign in with Google"**
3. **Complete Google OAuth flow**
4. **Check Supabase Dashboard → Authentication → Users**
5. **You should see your user account**

---

## 📦 Step 8: Install Frontend Dependencies

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install additional dependencies (if needed)
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

---

## 🚀 Step 9: Deploy to Production

### Update Environment Variables in Vercel

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings → Environment Variables**
4. **Add:**
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

5. **Redeploy your application**

### Update Supabase Auth URLs

1. **Go to Supabase → Authentication → URL Configuration**
2. **Update Site URL to production:**
   ```
   https://your-production-domain.vercel.app
   ```
3. **Add production redirect URL:**
   ```
   https://your-production-domain.vercel.app/**
   ```

---

## 🔍 Troubleshooting

### Edge Functions Not Working

```bash
# Check function logs
supabase functions logs search-events

# Check secrets are set
supabase secrets list

# Redeploy function
supabase functions deploy search-events
```

### Google OAuth Not Working

- Verify redirect URIs match exactly
- Check Site URL in Supabase Auth settings
- Ensure Google OAuth is enabled in Supabase
- Check browser console for errors

### Database Connection Issues

- Verify project URL and anon key are correct
- Check RLS policies are enabled
- Test connection in Supabase SQL Editor

### Search Returns No Results

- Check Edge Function logs for errors
- Verify API keys are set correctly
- Test with mock data first
- Check network tab in browser DevTools

---

## 📊 Monitoring and Analytics

### View Function Logs

```bash
# Real-time logs
supabase functions logs search-events --follow

# Filter by error
supabase functions logs search-events | grep ERROR
```

### Database Usage

- Go to Supabase Dashboard → Reports
- Monitor:
  - Database size
  - API requests
  - Active users
  - Function invocations

---

## 💰 Cost Estimation (Free Tier Limits)

**Supabase Free Tier:**
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users
- 500,000 Edge Function invocations

**API Costs:**
- SerpAPI: 100 searches/month free
- Perplexity: 5 requests/day free
- OpenAI: Pay-as-you-go (~$0.002 per search)
- Gemini: Free tier available

**Estimated Monthly Cost:**
- Development: **$0** (free tiers)
- Light production (<1000 users): **$5-10**
- Medium production (1000-10000 users): **$20-50**

---

## 🎉 You're All Set!

Your Supabase backend is now configured with:
- ✅ PostgreSQL database with proper schema
- ✅ Row-Level Security policies
- ✅ Google OAuth authentication
- ✅ Edge Functions for event search
- ✅ User saved events functionality
- ✅ Search history tracking

**Next Steps:**
1. Update your frontend to use Supabase client
2. Implement auth UI components
3. Test search functionality
4. Deploy to production

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🆘 Need Help?

- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Documentation: https://supabase.com/docs
