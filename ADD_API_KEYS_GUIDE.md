# How to Add API Keys to Supabase Edge Functions

## Quick Reference: Your API Keys

Based on the n8n workflow and current setup, here are the API keys you need:

### ✅ Already Configured (You have these):
1. **SERP_API_KEY** - For Google search results
2. **PERPLEXITY_API_KEY** - For AI-powered web search
3. **OPENAI_API_KEY** - For GPT-4o-mini enhancement
4. **GOOGLE_AI_API_KEY** - For Gemini fallback

### 🆕 New Keys to Add:
5. **ANTHROPIC_API_KEY** - For Claude 3.7 Sonnet (Phase 2 improvement)
   - Get your key at: https://console.anthropic.com/settings/keys
   - Format: `sk-ant-api03-...` (starts with sk-ant)

6. **OPENWEATHER_API_KEY** - For weather-aware event recommendations (optional but recommended)
   - Get free at: https://openweathermap.org/api

7. **GOOGLE_MAPS_API_KEY** - For distance calculation (Phase 2, optional)
   - Get at: https://console.cloud.google.com/

---

## Method 1: Via Supabase CLI (Fastest)

### Step 1: Install Supabase CLI

```bash
# Install via npm
npm install -g supabase

# Or via Windows package manager
winget install Supabase.CLI
```

### Step 2: Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ozezwaqtumofuybazkvo
```

### Step 3: Add API Keys

```bash
# Add Anthropic API key (Claude)
supabase secrets set ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# Add OpenWeatherMap key (get yours at openweathermap.org)
supabase secrets set OPENWEATHER_API_KEY="your-openweather-key-here"

# Add Google Maps key (optional, for Phase 2)
supabase secrets set GOOGLE_MAPS_API_KEY="your-google-maps-key-here"
```

### Step 4: Verify Keys are Set

```bash
# List all secrets (won't show values, just names)
supabase secrets list
```

You should see:
```
✓ SERP_API_KEY
✓ PERPLEXITY_API_KEY
✓ OPENAI_API_KEY
✓ GOOGLE_AI_API_KEY
✓ ANTHROPIC_API_KEY (new)
✓ OPENWEATHER_API_KEY (new)
```

---

## Method 2: Via Supabase Dashboard (Manual)

### Step 1: Go to Project Settings

1. Open: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo
2. Click **"Project Settings"** (gear icon in left sidebar)
3. Click **"Edge Functions"** tab
4. Scroll to **"Secrets"** section

### Step 2: Add Secrets

Click **"Add new secret"** and enter:

#### Secret 1: ANTHROPIC_API_KEY
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** `your-anthropic-api-key-here` (get from https://console.anthropic.com/)
- Click **"Add secret"**

#### Secret 2: OPENWEATHER_API_KEY (get yours first)
- **Name:** `OPENWEATHER_API_KEY`
- **Value:** `your-key-from-openweathermap.org`
- Click **"Add secret"**

#### Secret 3: GOOGLE_MAPS_API_KEY (optional, Phase 2)
- **Name:** `GOOGLE_MAPS_API_KEY`
- **Value:** `your-google-maps-key`
- Click **"Add secret"**

### Step 3: Verify in Dashboard

You should see all secrets listed (values hidden for security):
- ✅ SERP_API_KEY
- ✅ PERPLEXITY_API_KEY
- ✅ OPENAI_API_KEY
- ✅ GOOGLE_AI_API_KEY
- ✅ ANTHROPIC_API_KEY ← NEW
- ✅ OPENWEATHER_API_KEY ← NEW

---

## Method 3: Via Supabase Vault (Alternative)

This is another way using Supabase's secret management:

1. Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/settings/vault
2. Click **"New secret"**
3. Enter:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Secret:** Your Claude API key
4. Click **"Add secret"**
5. Repeat for other keys

---

## How to Get Missing API Keys

### 🔑 OpenWeatherMap API Key (FREE)

1. Go to: https://openweathermap.org/api
2. Click **"Sign Up"** (free account)
3. After signup, go to **"API keys"** tab
4. Copy your default API key
5. Free tier: 1000 calls/day (more than enough)

**Cost:** FREE forever for basic weather data

### 🔑 Anthropic API Key (Claude)

To get your Anthropic API key:
1. Go to: https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy the key (format: `sk-ant-api03-...`)
4. Add it to Supabase secrets

**Cost:** ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Average search: ~$0.40 with extended thinking

### 🔑 Google Maps API Key (Optional, Phase 2)

1. Go to: https://console.cloud.google.com/
2. Create new project (or select existing)
3. Enable **"Maps JavaScript API"** and **"Geocoding API"**
4. Go to **"Credentials"** → Create API Key
5. Restrict key to your domain for security

**Cost:** $0.005 per geocoding request, $200 free credit monthly

---

## Testing API Keys After Adding

### Test 1: Check if Keys are Loaded

After adding keys, deploy your Edge Function and check logs:

```bash
# Deploy function
supabase functions deploy search-events

# Check logs
supabase functions logs search-events --follow
```

Look for:
```
🔑 API Keys Status:
✅ SERP_API_KEY: Loaded
✅ PERPLEXITY_API_KEY: Loaded
✅ OPENAI_API_KEY: Loaded
✅ ANTHROPIC_API_KEY: Loaded
✅ OPENWEATHER_API_KEY: Loaded
```

### Test 2: Make a Test Search

```bash
# Test search via curl
curl -X POST https://ozezwaqtumofuybazkvo.supabase.co/functions/v1/search-events \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "location": "Zürich",
    "activity_type": "Concerts",
    "timeframe": "this week"
  }'
```

### Test 3: Verify Weather API

In the logs, you should see:
```
🌤️ Weather: 15°C, Partly cloudy
✅ Weather data obtained for Zürich
```

---

## Common Issues & Solutions

### Issue 1: "API Key not found"

**Solution:**
```bash
# Re-add the secret
supabase secrets set ANTHROPIC_API_KEY="your-key-here"

# Wait 1-2 minutes for propagation
# Redeploy function
supabase functions deploy search-events
```

### Issue 2: "Invalid API Key"

**Solution:**
- Check for extra spaces in the key
- Verify key is active in provider dashboard
- Try regenerating the key

### Issue 3: Secrets not appearing after adding

**Solution:**
```bash
# Unset and re-add
supabase secrets unset ANTHROPIC_API_KEY
supabase secrets set ANTHROPIC_API_KEY="your-key-here"
```

### Issue 4: Rate limits

**Solution:**
- OpenWeatherMap: Upgrade to paid tier ($0.0015/call)
- Anthropic: Check usage at console.anthropic.com
- Add caching to reduce API calls

---

## Security Best Practices

### ✅ DO:
- Store all API keys in Supabase Secrets (not in code)
- Restrict API keys to your domain (if provider allows)
- Monitor usage in provider dashboards
- Rotate keys every 90 days
- Use different keys for dev/staging/prod

### ❌ DON'T:
- Never commit API keys to Git
- Don't share keys in public channels
- Don't use production keys in development
- Don't store keys in frontend code
- Don't hardcode keys in Edge Functions

---

## Quick Command Reference

```bash
# List all secrets
supabase secrets list

# Add a secret
supabase secrets set KEY_NAME="value"

# Remove a secret
supabase secrets unset KEY_NAME

# Deploy function (needed after adding secrets)
supabase functions deploy search-events

# View logs
supabase functions logs search-events --follow

# Test function locally (with .env file)
supabase functions serve search-events
```

---

## Environment Variables for Local Development

Create `.env.local` file in your project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://ozezwaqtumofuybazkvo.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Keys (for local testing only)
SERP_API_KEY=your-serp-key
PERPLEXITY_API_KEY=your-perplexity-key
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-gemini-key
ANTHROPIC_API_KEY=your-anthropic-key-here
OPENWEATHER_API_KEY=your-weather-key
```

**⚠️ IMPORTANT:** Add `.env.local` to `.gitignore` to prevent committing keys!

---

## Cost Monitoring

After adding all keys, monitor costs:

### Anthropic (Claude)
- Dashboard: https://console.anthropic.com/
- Set spending limits
- Average cost: $0.40/search with extended thinking

### OpenWeatherMap
- Dashboard: https://openweathermap.org/api
- Free tier: 1000 calls/day
- Paid tier: $0.0015/call

### Google Maps
- Dashboard: https://console.cloud.google.com/billing
- Free: $200 credit/month
- Cost: $0.005/geocoding request

---

## Summary Checklist

After adding keys, verify:

- [ ] All secrets added to Supabase
- [ ] Edge Function redeployed
- [ ] Test search returns results
- [ ] Weather data appears in logs
- [ ] No "API key not found" errors
- [ ] Cost monitoring enabled
- [ ] `.env.local` in `.gitignore`

---

## Need Help?

**Supabase Docs:** https://supabase.com/docs/guides/functions/secrets
**Anthropic Docs:** https://docs.anthropic.com/
**OpenWeather Docs:** https://openweathermap.org/api

**Support:**
- Check Supabase logs first
- Verify key is active in provider dashboard
- Try removing and re-adding the secret
- Wait 1-2 minutes for propagation after adding

---

**Last Updated:** 2025-01-15
**Note:** Remember to get your Anthropic API key from https://console.anthropic.com/settings/keys
