# 🚀 Deploy Instructions - Final Fixes

## ✅ **Current Status:**

**Good news:** Perplexity is working! 🎉

```
✅ Perplexity found 10 events
✅ SerpAPI found 2 events
📊 Total: 11 events
```

**But:** Database save error needs to be fixed by deploying the latest code.

---

## 🔧 **What Was Fixed (Commit b218cac):**

### **Problem:**
```
Error saving events: Could not find the 'venue_type' column of 'events' in the schema cache
```

### **Solution:**
Removed `venue_type` field from the event object (your database table doesn't have this column).

---

## 📋 **DEPLOY THIS NOW:**

### **File to Deploy:**
`supabase/functions/search-events-agent/index.ts`

### **Method 1: Copy/Paste from Local File (FASTEST)**

1. **Open the fixed file:**
   - Location: `D:\virtual\whatsUP\supabase\functions\search-events-agent\index.ts`
   - OR: View on GitHub: https://github.com/shakespear95/whatsUP/blob/test/supabase/functions/search-events-agent/index.ts

2. **Copy entire file contents** (all lines)

3. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/functions
   ```

4. **Click "search-events-agent"** function

5. **Paste the code** (replace all existing code)

6. **Click "Deploy"** or **"Save & Deploy"**

7. **Wait for deployment** (30 seconds)

---

### **Method 2: Via Supabase CLI**

```bash
cd D:\virtual\whatsUP
supabase functions deploy search-events-agent
```

---

## 🧪 **After Deployment - Test:**

1. **Open your app**
2. **Try a search** (any location/category)
3. **Check Supabase logs:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/logs/edge-functions
   ```

**Should see:**
```
✅ Perplexity found 10 events
✅ SerpAPI found 2 events
✅ Saved 11 events to database  ← NEW: No more error!
📊 Total unique events: 11
```

**Should NOT see:**
```
❌ Error saving events: Could not find the 'venue_type' column
```

---

## 📊 **Current Working State:**

| Component | Status | Details |
|-----------|--------|---------|
| **Authentication** | ✅ Working | User logged in successfully |
| **Perplexity API** | ✅ Working | Using 'sonar' model, finding 10 events |
| **SerpAPI** | ✅ Working | Finding 2 events |
| **Database Save** | ⚠️ Needs Deploy | Fixed in code, needs deployment |
| **AI Enhancement** | ⚠️ Optional | No ANTHROPIC_API_KEY (Claude) |

---

## 🎯 **What You'll Get After Deploy:**

### **Before (Current):**
```
11 events found
❌ Error saving to database
⚠️ Events shown but not saved
```

### **After (Deployment):**
```
11 events found
✅ Saved to database successfully
✅ Events cached for faster future searches
✅ No errors
```

---

## 💡 **Optional Enhancements (Later):**

### **1. Add Claude API for Better Descriptions**

Currently skipped:
```
⚠️ No Anthropic API key, returning unenhanced events
```

**To enable:**
1. Get Claude API key: https://console.anthropic.com/
2. Add to Supabase:
   - Settings → Edge Functions → Secrets
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-...`
3. Redeploy function

**Benefit:** AI enhances event descriptions with:
- Engaging 2-3 sentence descriptions
- Special features highlighting
- Weather warnings for outdoor events

---

### **2. Add Weather API**

Currently:
```
⚠️ No weather API key, skipping weather data
🌤️ Weather: unknown, 20°C
```

**To enable:**
1. Get OpenWeather API key: https://openweathermap.org/api
2. Add to Supabase:
   - Name: `OPENWEATHER_API_KEY`
   - Value: `your-key`
3. Redeploy

**Benefit:**
- Weather-aware event filtering
- Indoor event prioritization in bad weather
- Current temperature and conditions

---

## ✅ **Quick Checklist:**

- [ ] Latest code committed to GitHub (commit b218cac)
- [ ] Open search-events-agent in Supabase dashboard
- [ ] Copy/paste latest code OR use CLI deploy
- [ ] Click Deploy
- [ ] Wait 30 seconds
- [ ] Test search in app
- [ ] Check logs - should see "✅ Saved X events"
- [ ] No more venue_type errors!

---

## 🎉 **Summary:**

**Main Issue Fixed:** Database schema mismatch (venue_type)

**Current Performance:**
- 10 events from Perplexity ✅
- 2 events from SerpAPI ✅
- 11 total unique events ✅
- Authentication working ✅

**Just needs:** One deployment to fix database saves!

---

**Created:** 2025-01-19
**Commit:** b218cac
**Status:** ✅ Ready to Deploy
**Priority:** Deploy search-events-agent now!
