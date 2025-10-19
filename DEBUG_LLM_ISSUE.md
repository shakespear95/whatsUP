# 🔍 Debug Guide: Why Are Only SerpAPI Results Showing?

## Problem Statement
**Issue:** All search results are coming from SerpAPI only. Perplexity and OpenAI/Gemini LLMs are not working or post-processing events.

---

## ✅ What Was Done

### 1. Added Comprehensive Logging
Just deployed extensive logging to track the entire search pipeline:

**Commit:** `c3dc6f0` - Add comprehensive logging to debug LLM execution flow

**Logging Points Added:**
- 🔑 **API Key Status Check** - Shows which APIs are configured
- 🔍 **LAYER 2** - Tracks parallel search execution (SerpAPI + Perplexity)
- 🤖 **[Perplexity]** - Detailed logging of Perplexity API calls
- 🎨 **[Enhancement]** - Tracks OpenAI/Gemini enhancement attempts
- ❌ **Error Details** - Full error messages with stack traces

---

## 📋 How to Debug

### Step 1: Deploy the Edge Function

**You need to deploy the updated Edge Function to Supabase:**

```bash
# If you have Supabase CLI installed:
supabase functions deploy search-events

# OR deploy via Supabase Dashboard:
# 1. Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/functions
# 2. Click on "search-events"
# 3. Click "Deploy" button
# 4. It should auto-deploy from GitHub
```

**Alternative (Manual Deploy):**
1. Go to Supabase Dashboard → Edge Functions
2. Click "search-events"
3. Copy the entire contents of `supabase/functions/search-events/index.ts`
4. Paste in the editor
5. Click "Deploy"

---

### Step 2: Check Logs in Real-Time

**Direct Link to Logs:**
```
https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/logs/edge-functions
```

**Setup:**
1. Open the logs page
2. Filter by function: `search-events`
3. Toggle **"Auto-refresh"** (top right corner)
4. Open your app in another tab
5. Perform a search
6. Watch logs appear in real-time

---

### Step 3: What to Look For

#### **A. API Key Status (First Log)**
Look for this at the start of every search:
```json
🔑 API Keys Status: {
  perplexity: "✅ Available" or "❌ Missing",
  openai: "✅ Available" or "❌ Missing",
  gemini: "✅ Available" or "❌ Missing",
  serp: "✅ Available" or "❌ Missing"
}
```

**What it means:**
- ✅ = API key is configured in Supabase
- ❌ = API key is NOT configured (that API won't be used)

**If Perplexity shows ❌:**
→ **You need to add the PERPLEXITY_API_KEY to Supabase**
→ Go to: Settings → Edge Functions → Secrets
→ Add: `PERPLEXITY_API_KEY` = `your-key-here`

---

#### **B. Parallel Search Execution**
You should see:
```
🚀 Running 2 search APIs in parallel...
⏳ Waiting for 2 API providers to respond...
```

Then one of these for each provider:

**Success:**
```
✅ SerpAPI found 15 events
✅ Perplexity found 12 events
```

**Failure:**
```
❌ Perplexity FAILED with error: [error details]
❌ Perplexity Error details: [JSON error object]
```

**Empty:**
```
⚠️ Perplexity returned 0 events (fulfilled but empty)
```

---

#### **C. Perplexity Detailed Logs**
If Perplexity is configured, you should see:
```
🤖 [Perplexity] Starting search...
🔍 [Perplexity] Query: Find 15 real upcoming Concerts events in Zürich...
🔍 [Perplexity] Using model: llama-3.1-sonar-large-128k-online
📡 [Perplexity] Response status: 200
✅ [Perplexity] Got response, processing results...
📊 [Perplexity] Processed 12 events
```

**If you DON'T see these logs:**
→ Perplexity is NOT being called
→ Check API key configuration

**If you see error logs:**
→ Check the error message
→ Common errors:
  - `401 Unauthorized` = Invalid API key
  - `402 Payment Required` = No credits left
  - `429 Rate Limited` = Too many requests
  - `500 Server Error` = Perplexity is down

---

#### **D. Enhancement Layer**
After finding events, should see:
```
🎨 [Enhancement] Starting to enhance 20 real events with AI...
🎨 [Enhancement] Available APIs: {
  openai: "✅ Available",
  gemini: "✅ Available"
}
🎨 [Enhancement] Trying OpenAI for enhancement...
🤖 [OpenAI Enhancement] Processing 20 events...
🤖 [OpenAI Enhancement] Calling OpenAI API with gpt-4o-mini...
📡 [OpenAI Enhancement] Response status: 200
✅ [OpenAI Enhancement] Got response, parsing JSON...
✅ [OpenAI Enhancement] Successfully enhanced 20 events
```

**If you see:**
```
⚠️ [Enhancement] No AI API available for enhancement, returning raw SerpAPI/Perplexity events
```
→ Neither OpenAI nor Gemini keys are configured
→ Events will be returned without enhancement (less detailed descriptions)

---

## 🔧 Common Issues & Fixes

### Issue 1: Perplexity Not Called At All
**Symptoms:**
- No `[Perplexity]` logs appear
- API Keys Status shows: `perplexity: "❌ Missing"`

**Fix:**
1. Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/settings/functions
2. Click "Add Secret"
3. Name: `PERPLEXITY_API_KEY`
4. Value: Your Perplexity API key from https://www.perplexity.ai/settings/api
5. Click "Save"
6. Redeploy the Edge Function

---

### Issue 2: Perplexity Returns 0 Events
**Symptoms:**
```
⚠️ [Perplexity] returned 0 events (fulfilled but empty)
```

**Possible Causes:**
1. **Query too specific** - No events match the search
2. **Location not recognized** - Try a major city
3. **Perplexity couldn't parse results** - Check raw response

**Debug:**
- Look for the query being sent: `🔍 [Perplexity] Query: ...`
- Try a broader search (e.g., "Concerts" in a major city)
- Check if the response is being parsed correctly

---

### Issue 3: Perplexity Fails With Error
**Symptoms:**
```
❌ [Perplexity] FAILED with error: Perplexity error 401: Unauthorized
```

**Common Errors:**

| Error | Meaning | Fix |
|-------|---------|-----|
| 401 Unauthorized | Invalid API key | Check key is correct, regenerate if needed |
| 402 Payment Required | Out of credits | Add credits to Perplexity account |
| 429 Rate Limited | Too many requests | Wait, or upgrade plan |
| 500 Server Error | Perplexity is down | Wait and retry |
| Timeout | Request took too long | Increase timeout (currently 90s) |

---

### Issue 4: Enhancement Not Running
**Symptoms:**
```
⚠️ [Enhancement] OpenAI API key not configured, skipping OpenAI
⚠️ [Enhancement] Gemini API key not configured, skipping Gemini
⚠️ [Enhancement] No AI API available for enhancement, returning raw events
```

**What This Means:**
- Events ARE found (from SerpAPI/Perplexity)
- But they're NOT being enhanced with better descriptions
- You're getting raw event data

**Fix:**
Add OpenAI or Gemini API key:

**For OpenAI:**
1. Go to Supabase → Settings → Edge Functions → Secrets
2. Add: `OPENAI_API_KEY` = `sk-...` (from https://platform.openai.com/api-keys)
3. Redeploy

**For Gemini:**
1. Go to Supabase → Settings → Edge Functions → Secrets
2. Add: `GOOGLE_AI_API_KEY` = `...` (from https://makersuite.google.com/app/apikey)
3. Redeploy

---

### Issue 5: Only SerpAPI Working
**Symptoms:**
```
✅ SerpAPI found 15 events
❌ Perplexity FAILED with error: ...
⚠️ [Enhancement] No AI API available
```

**This Means:**
- SerpAPI is the only working API
- Perplexity failed (check error)
- No enhancement happening

**Result:**
- You get 15 raw Google search results
- No AI-generated descriptions
- No AI filtering/enhancement

**Fix:**
1. Fix Perplexity error (see above)
2. Add OpenAI or Gemini key for enhancement
3. Redeploy Edge Function

---

## 📊 Expected Log Flow (Healthy Search)

```
🔍 Search Request: { location: "Zürich", activity_type: "Concerts", ... }

🤖 Starting LAYERED intelligent search...
🔑 API Keys Status: {
  perplexity: "✅ Available",
  openai: "✅ Available",
  gemini: "✅ Available",
  serp: "✅ Available"
}

🌤️ Weather: clear, 15°C - clear sky

🔍 LAYER 2: Calling searchRealEventsInParallel...
🚀 Running 2 search APIs in parallel...
⏳ Waiting for 2 API providers to respond...

🔍 SerpAPI query (enhanced + weather-aware): ...
🤖 [Perplexity] Starting search...
🔍 [Perplexity] Query: Find 15 real upcoming Concerts events in Zürich...
🔍 [Perplexity] Using model: llama-3.1-sonar-large-128k-online

📡 [Perplexity] Response status: 200
✅ [Perplexity] Got response, processing results...
📊 [Perplexity] Processed 12 events

✅ SerpAPI found 15 events
✅ Perplexity found 12 events

📊 Total unique events after deduplication: 20
📊 LAYER 2 Complete: Got 20 real events

✅ Found 20 real events, enhancing with AI + weather context...
🔍 LAYER 3: Calling enhanceEventsWithAI...

🎨 [Enhancement] Starting to enhance 20 real events with AI...
🎨 [Enhancement] Available APIs: { openai: "✅ Available", gemini: "✅ Available" }
🎨 [Enhancement] Trying OpenAI for enhancement...
🤖 [OpenAI Enhancement] Processing 20 events...
🤖 [OpenAI Enhancement] Calling OpenAI API with gpt-4o-mini...
📡 [OpenAI Enhancement] Response status: 200
✅ [OpenAI Enhancement] Got response, parsing JSON...
✅ [OpenAI Enhancement] Successfully enhanced 20 events

📊 LAYER 3 Complete: Returning 20 enhanced events

✅ Search completed - returning 20 events
```

---

## 🎯 Quick Diagnostic Checklist

Run a search and check these in order:

- [ ] **API Keys Status log appears** with all providers
- [ ] **Perplexity shows ✅ Available** (not ❌ Missing)
- [ ] **OpenAI or Gemini shows ✅ Available**
- [ ] **LAYER 2 starts** with "Running 2 search APIs in parallel"
- [ ] **Perplexity logs appear** with [Perplexity] prefix
- [ ] **Perplexity Response status: 200** (not 401, 402, 429, 500)
- [ ] **Perplexity Processed X events** (X > 0)
- [ ] **SerpAPI found X events** (X > 0)
- [ ] **LAYER 3 starts** with "Calling enhanceEventsWithAI"
- [ ] **Enhancement layer runs** OpenAI or Gemini
- [ ] **OpenAI Response status: 200**
- [ ] **Successfully enhanced X events**

---

## 🚀 Next Steps

### After Deploying:

1. **Check the logs immediately:**
   - https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/logs/edge-functions

2. **Do a test search:**
   - Open your app: https://whats-up-git-test-shakespears-projects.vercel.app
   - Log in (required)
   - Search for: "Concerts in Zürich, this week"

3. **Watch the logs:**
   - Look for the patterns above
   - Identify which step is failing
   - Check error messages

4. **Share the logs with me:**
   - Copy the full log output
   - I'll help diagnose the exact issue

---

## 💡 Most Likely Issues

Based on your description ("only SerpAPI results, LLMs not working"):

### Hypothesis 1: Perplexity API Key Missing ⭐ MOST LIKELY
**Check:** Do you see `perplexity: "❌ Missing"` in API Keys Status?
**Fix:** Add PERPLEXITY_API_KEY in Supabase secrets

### Hypothesis 2: Perplexity API Key Invalid
**Check:** Do you see `❌ [Perplexity] API returned error 401`?
**Fix:** Verify the API key is correct, regenerate if needed

### Hypothesis 3: Perplexity Returning Empty Results
**Check:** Do you see `⚠️ Perplexity returned 0 events`?
**Fix:** Try broader searches, check query format

### Hypothesis 4: Enhancement Failing Silently
**Check:** Do you see `⚠️ No AI API available for enhancement`?
**Impact:** Events show but with poor descriptions
**Fix:** Add OPENAI_API_KEY or GOOGLE_AI_API_KEY

---

## 📝 Test Search Examples

Try these searches and check logs:

**Test 1: Broad Search**
```
Location: Zürich
Category: Concerts
Timeframe: this week
```
Expected: Should find 15-20 events

**Test 2: Specific Search**
```
Location: New York
Category: Concerts
Timeframe: this weekend
```
Expected: Should find 15-20 events

**Test 3: Small City**
```
Location: Bern
Category: Theater
Timeframe: today
```
Expected: Might find fewer events (5-10)

---

## 🔍 How to Read Error Logs

### Perplexity Error Example:
```json
❌ [Perplexity] FAILED with error: Perplexity error 401: Unauthorized
❌ [Perplexity] Error details: {
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```
**Meaning:** The PERPLEXITY_API_KEY is wrong or expired

### OpenAI Error Example:
```json
❌ [OpenAI Enhancement] API error 429: Rate limit exceeded
```
**Meaning:** Too many OpenAI requests, need to wait or upgrade

---

## 📞 Need Help?

After deploying and checking logs:

1. Copy the full log output from a search
2. Share it so I can see:
   - Which APIs are configured
   - Which APIs are being called
   - Where the failure is happening
   - What error messages appear

The logs will tell us EXACTLY why Perplexity and OpenAI aren't working!

---

**Created:** 2025-01-19
**Status:** 🔍 Debugging in Progress
**Commit:** c3dc6f0 - Comprehensive logging added
