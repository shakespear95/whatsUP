# AI Agent System Setup Guide

**Purpose**: Set up Claude AI Agent with weather and enhanced search capabilities

---

## 🔑 Required API Keys

You'll need the following API keys:

### 1. **Anthropic (Claude) API Key** ⭐ NEW
- **What it does**: Powers the AI agent for intelligent event discovery
- **Get it from**: https://console.anthropic.com/
- **Cost**: ~$0.03 per search (Claude Sonnet 3.7)
- **How to get**:
  1. Go to https://console.anthropic.com/
  2. Sign up or log in
  3. Go to API Keys section
  4. Create new key (starts with `sk-ant-`)

### 2. **OpenWeatherMap API Key** ⭐ NEW
- **What it does**: Provides real-time weather data for event recommendations
- **Get it from**: https://openweathermap.org/api
- **Cost**: FREE (up to 1000 calls/day)
- **How to get**:
  1. Go to https://openweathermap.org/api
  2. Sign up for free account
  3. Go to API keys section
  4. Copy your default API key

### 3. **Existing Keys** (Already configured)
- ✅ SerpAPI Key
- ✅ Perplexity API Key
- ✅ OpenAI API Key
- ✅ Google AI (Gemini) Key

---

## 📝 Step-by-Step Setup

### **Step 1: Add Keys to Supabase**

You need to add the API keys as secrets in Supabase Edge Functions.

**Option A: Using Supabase CLI** (Recommended)

```bash
# Make sure you have Supabase CLI installed
# npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ozezwaqtumofuybazkvo

# Add the new API keys
supabase secrets set ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"
supabase secrets set OPENWEATHER_API_KEY="your-openweather-key-here"

# Verify secrets are set
supabase secrets list
```

**Option B: Using Supabase Dashboard** (Manual)

1. Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/settings/vault
2. Click "New secret"
3. Add secrets:
   - Name: `ANTHROPIC_API_KEY`, Value: `sk-ant-your-key...`
   - Name: `OPENWEATHER_API_KEY`, Value: `your-weather-key...`
4. Click "Add secret" for each

### **Step 2: Verify Existing Keys**

Make sure these are already set in Supabase:

```bash
# Check if these exist:
supabase secrets list

# Should show:
# ✓ SERP_API_KEY
# ✓ PERPLEXITY_API_KEY
# ✓ OPENAI_API_KEY
# ✓ GOOGLE_AI_API_KEY
# ✓ ANTHROPIC_API_KEY (new)
# ✓ OPENWEATHER_API_KEY (new)
```

### **Step 3: Deploy Updated Edge Function**

Once keys are set, deploy the updated search function:

```bash
# Deploy the search-events function
supabase functions deploy search-events

# Check logs to verify it's working
supabase functions logs search-events
```

---

## 🧪 Testing the Setup

### **Test 1: Check if Keys are Loaded**

The Edge Function will log on startup:

```
🔑 API Keys Status:
✅ SERP_API_KEY: Loaded
✅ PERPLEXITY_API_KEY: Loaded
✅ OPENAI_API_KEY: Loaded
✅ ANTHROPIC_API_KEY: Loaded
✅ OPENWEATHER_API_KEY: Loaded
```

### **Test 2: Test Search with Agent**

Make a search in your app and check the logs:

**Expected logs:**
```
🔍 Search Request: { location: "Zürich", activity_type: "Concerts", timeframe: "This week" }
🌤️ Fetching weather for Zürich...
✅ Weather: 15°C, Partly cloudy
🤖 Starting Claude Agent...
🔧 Agent using tools: [Weather, Perplexity, SerpAPI]
✅ Agent found 12 events
🎯 Top recommendations: [Event 1, Event 2, Event 3]
```

### **Test 3: Verify Weather Integration**

Search for outdoor events on a rainy day:

**Expected behavior:**
- Indoor events prioritized
- Outdoor events marked with weather warning
- Agent mentions weather in recommendations

---

## 🐛 Troubleshooting

### **Error: "ANTHROPIC_API_KEY is not set"**

**Solution:**
```bash
# Set the key again
supabase secrets set ANTHROPIC_API_KEY="your-key"

# Redeploy function
supabase functions deploy search-events
```

### **Error: "Weather API rate limit exceeded"**

**Cause**: Free tier allows 1000 calls/day

**Solution:**
- Upgrade to paid plan ($0.0015 per call)
- Or implement caching (weather doesn't change every second)

### **Error: "Claude API rate limit"**

**Cause**: Too many requests to Claude API

**Solution:**
- Check your Anthropic dashboard for limits
- Implement request throttling
- Use database cache more aggressively

### **Logs show "Agent not enabled"**

**Cause**: Feature flag not set

**Solution:**
- The agent is automatically used when `ANTHROPIC_API_KEY` is present
- No additional configuration needed

---

## 📊 Monitoring & Logs

### **View Real-time Logs**

```bash
# Watch logs in real-time
supabase functions logs search-events --follow

# Filter for specific events
supabase functions logs search-events | grep "Agent"
supabase functions logs search-events | grep "Weather"
```

### **Key Log Markers**

Look for these in logs to monitor agent behavior:

| Log Marker | Meaning |
|------------|---------|
| `🤖 Claude Agent initialized` | Agent is ready |
| `🌤️ Weather fetched` | Weather API working |
| `🔧 Agent using tool: X` | Agent called a specific tool |
| `✅ Agent enhanced X events` | Agent successfully processed |
| `⚠️ Agent fallback` | Agent failed, using backup |

---

## 💰 Cost Monitoring

### **Expected Costs per 1000 Searches**

| Service | Cost | Notes |
|---------|------|-------|
| SerpAPI | $50 | Real event search |
| Perplexity | $10 | Web search |
| Claude Agent | $30 | AI enhancement (16K tokens) |
| OpenWeather | FREE | Up to 1000 calls/day |
| OpenAI | $5 | Backup enhancement |
| **Total** | **~$95** | Per 1000 searches |

### **Cost Optimization Tips**

1. **Enable aggressive caching** - Reduce API calls by 60%
2. **Use agent selectively** - Only for complex searches
3. **Weather caching** - Cache weather for 30 minutes
4. **Rate limiting** - Prevent abuse

---

## 🚀 What's New with Agent System

### **Before (Direct API Calls)**
```
User Search
    ↓
SerpAPI (parallel)
Perplexity (parallel)
    ↓
Combine results
    ↓
OpenAI enhance
    ↓
Return events
```

### **After (AI Agent)**
```
User Search
    ↓
Get Weather Data ← NEW
    ↓
SerpAPI (parallel)
Perplexity (parallel)
    ↓
Claude Agent decides: ← NEW
- Are events weather-appropriate?
- Need more hidden gems?
- Filter low-quality results?
- Add insider tips?
    ↓
Agent enhances with context
    ↓
Return smart recommendations
```

### **Benefits**
- ✅ Weather-aware recommendations
- ✅ Better quality filtering
- ✅ Hidden gems discovery
- ✅ Intelligent prioritization
- ✅ Context-aware descriptions

---

## 📝 Quick Reference Commands

```bash
# Add new API key
supabase secrets set KEY_NAME="value"

# List all secrets
supabase secrets list

# Deploy function
supabase functions deploy search-events

# View logs
supabase functions logs search-events

# Test function locally
supabase functions serve search-events

# Delete a secret (if needed)
supabase secrets unset KEY_NAME
```

---

## ✅ Setup Checklist

Before testing, make sure:

- [ ] Anthropic API key added to Supabase secrets
- [ ] OpenWeatherMap API key added to Supabase secrets
- [ ] All existing keys verified (SERP, Perplexity, OpenAI)
- [ ] Edge Function deployed with new code
- [ ] Logs show "API Keys Status: ✅ All loaded"
- [ ] Test search returns weather-aware results
- [ ] Agent logs appear in function logs

---

## 🆘 Need Help?

**Supabase Docs**: https://supabase.com/docs/guides/functions/secrets
**Anthropic Docs**: https://docs.anthropic.com/
**OpenWeather Docs**: https://openweathermap.org/api

**Common Issues**:
- Secrets not loading → Wait 1-2 minutes after setting
- Function errors → Check logs with `supabase functions logs`
- API rate limits → Check your API dashboard

---

**Last Updated**: January 13, 2025
**Status**: Ready for implementation
