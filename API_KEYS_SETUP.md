# 🔑 API Keys Setup - Your Existing Keys

Great news! You already have all 4 API keys. Here's how to configure them with Supabase.

## ✅ Your API Keys (Already Available)

- ✅ **OpenAI** - For AI-generated events (fallback)
- ✅ **SerpAPI** - For real event web search
- ✅ **Perplexity** - For real event search with web access
- ✅ **Google AI (Gemini)** - For AI-generated events (fallback)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `whatsup-events`
   - Database Password: (generate strong password)
   - Region: Choose closest to you
4. Wait ~2 minutes for project creation

### Step 2: Get Supabase Credentials

1. In Supabase Dashboard: **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...`

### Step 3: Update `.env.local`

Edit your `.env.local` file and replace:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co  # <- Your actual URL
VITE_SUPABASE_ANON_KEY=eyJ...                # <- Your actual anon key
```

### Step 4: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 5: Login and Link Project

```bash
# Login to Supabase
supabase login

# Link your project (get project-ref from dashboard URL)
supabase link --project-ref your-project-ref
```

### Step 6: Set Your API Keys (Automated Script)

**Windows:**
```bash
setup-api-keys.bat
```

**Mac/Linux:**
```bash
chmod +x setup-api-keys.sh
./setup-api-keys.sh
```

**Or manually:**
```bash
supabase secrets set OPENAI_API_KEY="your-openai-api-key-here"

supabase secrets set SERP_API_KEY="your-serpapi-key-here"

supabase secrets set PERPLEXITY_API_KEY="your-perplexity-key-here"

supabase secrets set GOOGLE_AI_API_KEY="your-gemini-key-here"
```

### Step 7: Create Database Tables

1. Go to Supabase Dashboard → **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"

### Step 8: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy search-events
supabase functions deploy save-event
supabase functions deploy unsave-event
supabase functions deploy my-events
```

### Step 9: Install Dependencies & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## ✅ Verify Setup

### Check Secrets are Set:
```bash
supabase secrets list
```

You should see:
```
OPENAI_API_KEY
SERP_API_KEY
PERPLEXITY_API_KEY
GOOGLE_AI_API_KEY
```

### Check Functions Deployed:
```bash
supabase functions list
```

You should see:
```
search-events
save-event
unsave-event
my-events
```

---

## 🔍 How Your Search Will Work

### Priority Order (Best to Fallback):

1. **Check Database Cache** (instant, free)
   - If events exist for location → return immediately

2. **Real Event Search** (3-5 seconds)
   - **SerpAPI** searches Google for real events
   - **Perplexity** searches web with AI
   - Combines results → returns real events

3. **AI Fallback** (if no real events found)
   - **OpenAI GPT-4o-mini** generates realistic events
   - **Gemini** as secondary fallback

### Search Flow Example:

```
User searches: "Concerts in Zurich this week"
    ↓
1. Check database cache → No results
    ↓
2. Call SerpAPI → Finds 3 real events
3. Call Perplexity → Finds 2 more real events
    ↓
4. Combine & deduplicate → 5 unique real events
    ↓
5. Save to database (for future cache hits)
    ↓
6. Return to user (3-5 seconds total)

Next user searches same location:
    ↓
1. Check database cache → Found 5 events!
    ↓
2. Return immediately (< 500ms) ✅
```

---

## 💰 API Usage & Costs

### Your Free Tier Limits:

| API | Free Tier | Cost After |
|-----|-----------|------------|
| **SerpAPI** | 100 searches/month | $50/month (5000 searches) |
| **Perplexity** | 5 requests/day | $20/month (5000 requests) |
| **OpenAI** | Pay-as-you-go | ~$0.002 per search |
| **Gemini** | Free tier available | Free tier generous |

### Cost Optimization with Caching:

**Without cache:**
- 1000 searches = 1000 API calls = ~$20-30/month

**With cache (70% hit rate):**
- 1000 searches = 300 API calls = ~$6-10/month

**Cache Hit Rate Improves Over Time:**
- Week 1: 20% (lots of new searches)
- Week 2: 50% (repeating locations)
- Week 3: 70%+ (most searches cached)

---

## 🧪 Test Your Setup

### Test 1: Check API Keys Set

```bash
supabase secrets list
```

### Test 2: Test Edge Function Locally

```bash
# Start local Supabase
supabase start

# Test search function
curl -X POST http://localhost:54321/functions/v1/search-events \
  -H "Content-Type: application/json" \
  -d '{"location":"Zurich","activity_type":"Concerts & Party","timeframe":"this week"}'
```

### Test 3: Check Function Logs

```bash
# Real-time logs
supabase functions logs search-events --follow
```

### Test 4: Test in Your App

1. Start app: `npm run dev`
2. Open: http://localhost:3000
3. Search for events in any city
4. Check browser DevTools → Network tab
5. Should see POST to `/functions/v1/search-events`
6. Response should include real events

---

## 🎯 What You'll Get

### Real Event Search Results:

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "serp-123",
        "title": "Zürich Jazz Night at Moods",
        "date": "2025-10-15",
        "venue": "Moods Jazz Club",
        "price": "35-50 CHF",
        "category": "Concerts & Party",
        "source": "SerpAPI",
        "real_event": true,
        "ticket_link": "https://moods.ch/events/...",
        ...
      },
      {
        "id": "perplexity-456",
        "title": "Rock Concert at Komplex 457",
        "source": "Perplexity",
        "real_event": true,
        ...
      }
    ],
    "totalResults": 8,
    "cached": false,
    "source": "SerpAPI+Perplexity"
  }
}
```

---

## 🚨 Troubleshooting

### Issue: "No API keys configured"

**Check:**
```bash
supabase secrets list
```

**Fix:**
```bash
# Rerun setup script
setup-api-keys.bat  # Windows
./setup-api-keys.sh # Mac/Linux
```

### Issue: Functions return mock data

**Cause:** API keys not set in Supabase secrets

**Fix:** Run `supabase secrets set` commands above

### Issue: Search takes too long

**Cause:** First search after deployment (no cache)

**Expected:**
- First search: 3-10 seconds (calling APIs)
- Subsequent searches: < 1 second (cached)

### Issue: "Function not found"

**Fix:**
```bash
supabase functions deploy search-events
```

---

## 📊 Monitor Your Usage

### Supabase Dashboard

1. Go to **Database** → **Functions**
2. View invocation logs and errors

### API Usage

- **SerpAPI**: https://serpapi.com/dashboard
- **Perplexity**: https://www.perplexity.ai/settings/api
- **OpenAI**: https://platform.openai.com/usage
- **Gemini**: https://makersuite.google.com/app/apikey

---

## 🎉 Success!

When setup is complete:

- ✅ Search returns **real events** from the web
- ✅ Fast responses with **database caching**
- ✅ Automatic fallback to **AI-generated** events
- ✅ User can **save events** (with authentication)
- ✅ **70% cost savings** from caching

**Your app is now production-ready with real event search!** 🚀

---

## 🆘 Need Help?

- Check logs: `supabase functions logs search-events`
- Verify secrets: `supabase secrets list`
- Test locally: `supabase start` then test function
- See full guide: `SUPABASE_SETUP.md`
