# Deployment Guide - EventFinder Bug Fixes

## Changes Made

### 1. ✅ Fixed Event Dates (Past Dates Issue)
**File:** `supabase/functions/search-events/index.ts`
**Lines:** 824-859
**What was fixed:**
- Events were showing dates from last month
- Now ensures all dates are in the future (starting tomorrow)
- Added validation to prevent past dates

### 2. ✅ Fixed Search Categories
**File:** `src/App.tsx`
**Lines:** 118-154
**What was fixed:**
- German categories (konzerte, buehne, kunst, etc.) now map to English for API
- Multiple categories and subcategories are combined into keywords
- Better search accuracy with category mapping

### 3. ✅ Fixed Ticket Link Buttons (White Button Issue)
**File:** `src/App.tsx`
**Lines:** 142-154
**What was fixed:**
- Ticket buttons were showing as white/broken
- Now properly creates button objects with type, value, and label
- Handles free events, link events, and website events

### 4. ✅ Fixed Perplexity Integration
**File:** `supabase/functions/search-events/index.ts`
**Lines:** 429-440
**What was fixed:**
- Perplexity wasn't receiving weather parameter
- Now includes weather context in queries
- Emphasizes FUTURE dates and official links

## How to Deploy

### Option 1: Deploy via Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI (if not installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref ozezwaqtumofuybazkvo

# 4. Deploy the updated Edge Function
supabase functions deploy search-events

# 5. Check logs to verify deployment
supabase functions logs search-events --follow
```

### Option 2: Deploy via Supabase Dashboard (Manual)

1. Go to: https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/functions

2. Click on `search-events` function

3. Click "Edit Function"

4. Copy the entire contents of `supabase/functions/search-events/index.ts`

5. Paste into the editor

6. Click "Deploy"

7. Verify deployment in logs

### Option 3: Deploy via Git Push (if enabled)

```bash
# Commit changes
git add .
git commit -m "Fix: Event dates, categories, ticket buttons, and Perplexity integration"

# Push to trigger auto-deployment (if configured)
git push origin main
```

## Frontend Deployment

The frontend changes in `src/App.tsx` need to be deployed to Vercel:

```bash
# 1. Build the project
npm run build

# 2. Commit and push (triggers auto-deploy if Vercel is connected)
git add .
git commit -m "Fix: Category mapping and ticket button rendering"
git push origin test

# Or deploy manually via Vercel CLI
vercel --prod
```

## Verification Steps

### 1. Test Date Generation
After deployment, search for events and verify:
- [ ] All event dates are today or in the future
- [ ] No dates from last month appear
- [ ] Dates are distributed across the selected timeframe

**Test Search:**
```javascript
// In browser console
fetch('https://ozezwaqtumofuybazkvo.supabase.co/functions/v1/search-events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'Zürich',
    activity_type: 'Concerts',
    timeframe: 'this week'
  })
})
.then(r => r.json())
.then(data => {
  const today = new Date().toISOString().split('T')[0];
  const allFuture = data.data.events.every(e => e.date >= today);
  console.log('All dates are future:', allFuture);
  console.log('Event dates:', data.data.events.map(e => e.date));
});
```

### 2. Test Categories
- [ ] Select a German category (e.g., "Konzerte & Musik")
- [ ] Verify it maps to "Concerts & Music" in API call
- [ ] Check that subcategories are included in keywords
- [ ] Verify search results match selected categories

**Check in Browser DevTools:**
```
Network → search-events → Payload
Should show:
{
  "activity_type": "Concerts & Music",  // Mapped from "konzerte"
  "keywords": "Concerts & Music, rock-pop, jazz-blues"  // Includes subcategories
}
```

### 3. Test Ticket Buttons
- [ ] Search for events
- [ ] Verify buttons appear (not white/broken)
- [ ] Click ticket buttons - should open in new tab
- [ ] Free events show green "Kostenlos" badge
- [ ] Events with links show blue "Tickets kaufen" button

**Visual Check:**
- Buttons should be visible (blue background)
- Text should be readable (white text)
- Clicking should open ticket website

### 4. Test Perplexity Integration
Check Supabase logs for Perplexity calls:

```bash
supabase functions logs search-events --follow
```

Look for:
```
🔍 Perplexity query: Find 10 real upcoming Concerts events in Zürich for this week starting from 2025-01-15...
```

Verify:
- [ ] Query includes current date
- [ ] Query emphasizes "FUTURE dates"
- [ ] Weather context is included (if weather API is configured)

## Rollback Plan

If something goes wrong:

### Rollback Edge Function:
```bash
# Via Supabase Dashboard
1. Go to Functions → search-events → Versions
2. Select previous version
3. Click "Restore"
```

### Rollback Frontend:
```bash
# Via Vercel Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

# Or via Git
git revert HEAD
git push origin test
```

## Monitoring Post-Deployment

### Check Error Rate
```bash
# Monitor for 5 minutes after deployment
supabase functions logs search-events --follow
```

### Key Metrics to Watch:
1. **Search Success Rate**
   - Should remain > 95%
   - Check for any new errors

2. **API Response Time**
   - Should be < 5 seconds
   - Perplexity calls may take 2-3 seconds

3. **Date Validation**
   - All returned dates should be >= today
   - No past dates in results

4. **User Feedback**
   - Monitor for bug reports about:
     - Missing categories
     - Broken buttons
     - Old events

## Environment Variables Check

Before deploying, ensure these are set in Supabase:

```bash
# Check via CLI
supabase secrets list

# Should show:
✓ SERP_API_KEY
✓ PERPLEXITY_API_KEY
✓ OPENAI_API_KEY
✓ GOOGLE_AI_API_KEY
✓ OPENWEATHER_API_KEY (optional)
✓ ANTHROPIC_API_KEY (optional, for future Claude Agent)
```

## Success Criteria

Deployment is successful if:

1. ✅ **Dates Fixed**
   - All search results show future dates only
   - No events from last month

2. ✅ **Categories Working**
   - German UI categories map correctly
   - Search returns relevant results
   - Subcategories are included

3. ✅ **Buttons Fixed**
   - Ticket buttons are visible (not white)
   - Buttons are clickable
   - Links open correctly

4. ✅ **Perplexity Working**
   - Real events are being found
   - Event details are accurate
   - Ticket links are valid

## Next Steps After Deployment

1. **Monitor for 24 hours** - Watch logs and user feedback

2. **Gather metrics:**
   - Search success rate
   - Event quality (real vs generated)
   - User satisfaction

3. **Consider Phase 2 improvements:**
   - Add Claude Agent layer (see N8N_INTEGRATION_IMPROVEMENTS.md)
   - Implement distance calculation
   - Enhanced event metadata

## Support & Troubleshooting

### Common Issues:

**Issue: Dates still showing past events**
```bash
# Check if Edge Function deployed
supabase functions list

# Redeploy
supabase functions deploy search-events --no-verify-jwt
```

**Issue: Categories not mapping**
```bash
# Check frontend build
npm run build

# Check console for errors
# Verify categoryMap is defined
```

**Issue: Buttons still white**
```bash
# Hard refresh browser (Ctrl+Shift+R)
# Clear Vercel cache
vercel --prod --force
```

**Issue: Perplexity not working**
```bash
# Check API key is set
supabase secrets list

# Check logs for errors
supabase functions logs search-events | grep "Perplexity"
```

## Contact

If you encounter issues:
1. Check Supabase logs first
2. Check browser console for frontend errors
3. Refer to CLAUDE.md for project architecture
4. Refer to N8N_INTEGRATION_IMPROVEMENTS.md for advanced features

---

**Deployment Checklist:**
- [ ] Edge Function deployed to Supabase
- [ ] Frontend deployed to Vercel
- [ ] Environment variables verified
- [ ] All 4 verification tests passed
- [ ] Monitoring active for 24 hours
- [ ] No critical errors in logs

**Deployed on:** _______________
**Deployed by:** _______________
**Status:** _______________
