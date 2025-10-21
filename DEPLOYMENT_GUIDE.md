# Supabase Edge Function Deployment Guide

## 🚀 How to Deploy Your Edge Function Updates

The code is pushed to GitHub, but Supabase Edge Functions need to be **manually deployed** to take effect.

---

## Option 1: Deploy via Supabase Dashboard (Easiest) ✅

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Click **"Edge Functions"** in the left sidebar

### Step 2: Redeploy the Function
1. Find `search-events-agent` in the list
2. Click the **three dots (•••)** menu
3. Select **"Deploy new version"** or **"Redeploy"**
4. Wait for deployment to complete (~30-60 seconds)

### Step 3: Verify Deployment
1. Check for **green checkmark** next to function name
2. Click on the function to see deployment logs
3. Look for latest deployment timestamp

---

## 🔧 What You Need to Deploy Right Now

The latest changes include:
- ✅ **Ultra-robust Claude JSON parsing** (fixes position 948 error)
- ✅ **JSON recovery strategies** (salvages partial results)
- ✅ **Smart quote fixes** (converts Unicode quotes)
- ✅ **Simplified Claude prompt** (reduces malformed JSON)

### Current Status:
- **GitHub**: ✅ Code pushed to `test` branch (commit `4ff8d5c`)
- **Supabase**: ❌ Old version still running (needs deployment)

---

## 📋 Quick Fix for Your Current Issues

### Issue 1: Claude JSON Error (position 948)
**Status**: Fixed in code, waiting for deployment

**Quick Fix**:
1. Deploy new version via Dashboard
2. Test a search
3. Check logs - should see "✅ Recovered X events" instead of error

### Issue 2: Perplexity 401 Error
**Status**: API key issue (not code)

**Fix**:
1. Supabase Dashboard → **Settings** → **Secrets**
2. Find `PERPLEXITY_API_KEY`
3. Either delete it or update with new key from https://www.perplexity.ai

---

## 🎯 Next Steps

1. **DEPLOY NOW** via Dashboard - Takes 2 minutes
2. **Test Search** with Barcelona/Events/Next Month
3. **Check Logs** to verify Claude JSON parsing works
4. **Fix or Remove** Perplexity key (optional)

---

Last Updated: 2025-10-21
Commit: 4ff8d5c
