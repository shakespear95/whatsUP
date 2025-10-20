# 🚀 Deploy Updated Edge Function to Supabase

## ⚠️ Current Issue
Your deployed `search-events-agent` function is the OLD version. The fixes are in GitHub but not deployed to Supabase.

## 📋 Evidence from Logs:
```
Error parsing Perplexity results: SyntaxError: Expected double-quoted property name in JSON at position 2969
⚠️ No Anthropic API key, returning unenhanced events
```

The new debugging lines I added are NOT showing up:
- ❌ Missing: "✅ Anthropic API key found, length: XX"
- ❌ Missing: "🔍 Available env vars: ..."

This proves the function needs redeployment.

---

## ✅ Solution: Deploy Latest Code

### **Option 1: Supabase Dashboard (FASTEST)**

1. **Open the latest code from GitHub:**
   https://github.com/shakespear95/whatsUP/blob/test/supabase/functions/search-events-agent/index.ts

2. **Click "Raw" button** to see plain code

3. **Copy ALL the code** (Ctrl+A, Ctrl+C)

4. **Go to Supabase Dashboard:**
   - Project: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo
   - Navigate to: **Edge Functions** → **search-events-agent**

5. **Replace the code:**
   - Delete all existing code in the editor
   - Paste the new code
   - Click **Save** or **Deploy**

6. **Wait 30 seconds** for deployment

7. **Test a search** in your app

---

### **Option 2: Supabase CLI**

```bash
cd D:\virtual\whatsUP
supabase functions deploy search-events-agent
```

---

## 🔍 What You Should See After Deployment:

### **Perplexity Fixed:**
```
✅ Perplexity found 10 events
📊 Perplexity processed 10 events
```
(No more JSON parsing errors!)

### **Claude API Key Debugging:**
```
✅ Anthropic API key found, length: 86
🤖 Claude Agent enhancing 10 events...
✅ Claude API response received
✅ Claude Agent enhanced 10 events
```

OR if key is missing:
```
⚠️ No Anthropic API key found in environment
🔍 Available env vars: []
```

---

## 🔧 If Anthropic Key Still Not Working:

After deploying, if you still see "⚠️ No Anthropic API key found":

### **Check Supabase Secrets:**
1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Look for: `ANTHROPIC_API_KEY`
3. If missing, click **Add Secret**:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `45cfcaa13583d62f4fd9a5900354385f1dc80a2757aa7fd77a57798664eae105`
4. Click **Save**
5. **Redeploy** the function (step 1 above)

### **Verify Secret Format:**
Make sure there are:
- ❌ No quotes around the key
- ❌ No extra spaces
- ❌ No line breaks
- ✅ Just the raw key value

---

## 📊 Current Status:

| Component | Status | Notes |
|-----------|--------|-------|
| **Code on GitHub** | ✅ Fixed | Commit 8292e9c |
| **Deployed on Supabase** | ❌ OLD | Needs deployment |
| **Perplexity API** | ⚠️ Failing | JSON parsing errors |
| **SerpAPI** | ✅ Working | Finding 10 events |
| **Claude/Anthropic** | ⚠️ No Key | Needs secret verification |
| **Database** | ✅ Working | Saving events successfully |

---

## 🎯 Action Required:

**Deploy the function NOW using Option 1 above** (copy/paste from GitHub)

This will:
1. ✅ Fix Perplexity JSON parsing
2. 🔍 Show detailed API key debugging
3. 📊 Better error logging

Once deployed, run another search and send me the new logs!

---

**GitHub Link:** https://github.com/shakespear95/whatsUP/blob/test/supabase/functions/search-events-agent/index.ts
**Commit:** 8292e9c
**Priority:** HIGH - Deploy immediately
