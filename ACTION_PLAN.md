# WhatsUP - Immediate Action Plan

## 🚨 Critical Issue: No Results Showing

### What Happened:
```
Backend: Found 10 events ✅
Claude:  Enhanced only 2 events ❌ (dropped 8!)
Frontend: Shows 0 events ❌ (filtered out the 2)
```

### Root Causes:
1. **Claude dropping 80% of events** - Too selective during enhancement
2. **Frontend filters** - Removing remaining events
3. **Generic event titles** - SerpAPI returns webpage titles, not real events

---

## ✅ Fixes Applied (Waiting for Deploy)

### Fix #1: Prevent Claude from Dropping Events
**Code changes** (commit `68ca9ea`):
- Claude prompt now says "You MUST return ALL events"
- Safety check: If Claude returns fewer, use original events
- Debug logging to show when events are dropped

### Fix #2: Map Crash Prevention
**Code changes** (commit `e1a7fc8`):
- Map handles missing coordinates gracefully
- No more "Cannot read properties of undefined" errors

### Fix #3: Ultra-Robust JSON Parsing
**Code changes** (commit `4ff8d5c`):
- 3-strategy JSON extraction
- Smart quote conversion
- Partial JSON recovery

---

## 🎯 **ACTION REQUIRED: Deploy to Supabase**

### Step 1: Deploy Edge Function (2 minutes)
1. Go to: https://supabase.com/dashboard
2. Click: **Edge Functions**
3. Find: `search-events-agent`
4. Click: **••• → Deploy new version**
5. Wait: 30-60 seconds

### Step 2: Delete Perplexity Key (Optional)
It's causing 401 errors and not needed:
1. Supabase Dashboard → **Settings** → **Secrets**
2. Find: `PERPLEXITY_API_KEY`
3. Click: **Delete**

### Step 3: Test Search
Search: "concerts in Zurich next week"

Expected after deploy:
- ✅ 10 events returned (not 2)
- ✅ No Claude JSON errors
- ✅ Map doesn't crash
- ⚠️ Some may still lack coordinates (SerpAPI issue)

---

## 📊 Why Only 2 Events Showed Up

### The Full Story:

**Phase 1 - Backend Search** (Working ✅):
```
SerpAPI:    Found 10 events ✅
Perplexity: Failed (401) ❌
OpenAI:     Found 0 events ⚠️
Facebook:   Failed (400) ❌
→ Total: 10 events
```

**Phase 2 - Claude Enhancement** (BROKEN ❌):
```
Input:  10 events
Claude: "These 8 events are low quality, I'll only return 2"
Output: 2 events ❌

WHY: Claude was being too selective
FIX: New prompt forces Claude to return ALL events
```

**Phase 3 - Frontend Filters** (Working but strict):
```
Input:  2 events
Filters: Category/keywords/budget checks
Output: 0 events ❌

WHY: The 2 events didn't match active filters
FIX: More events from backend = more likely to match
```

---

## 🔧 Additional Issues to Fix

### Issue 1: Generic Event Titles
**Problem**: SerpAPI returns:
- "Event Calendar bern"
- "Things to do in Geneva"
- "Bern Events - Discover..."

These are **webpage titles**, not real event names!

**Solution**: Use specialized event APIs:
```
Instead of:
  SerpAPI Google Search → Generic titles

Use:
  Eventbrite API → Real events
  Meetup API → Real events
  Facebook Events → Real events
```

### Issue 2: Missing Coordinates
**Why**: Generic titles can't be geocoded
- "Event Calendar bern" → Where is this venue?
- Real event: "Jazz Night at Marians Jazzroom, Engestrasse 54" → Can geocode!

**Solution**: Better event sources with real venues

---

## 📋 Future Improvements

### Priority 1: Add Real Event APIs
**Eventbrite** (Recommended):
```typescript
const response = await fetch(
  'https://www.eventbriteapi.com/v3/events/search/',
  {
    params: {
      'location.address': 'Zurich',
      token: EVENTBRITE_TOKEN
    }
  }
);
```

Benefits:
- Real event names
- Actual venues with addresses
- Coordinates included
- Ticket prices
- Images

### Priority 2: Filter Generic Results
Add validation to skip bad events:
```typescript
function isValidEvent(event) {
  // Skip generic titles
  if (event.title.includes('Event Calendar')) return false;
  if (event.title.includes('Things to do')) return false;
  
  // Require real venue
  if (!event.venue || event.venue === event.location) return false;
  
  return true;
}
```

### Priority 3: Improve Geocoding
Use Google Geocoding API (better than Nominatim):
- More accurate
- Handles partial addresses
- Includes venue coordinates

---

## ✅ What's Working Now

1. ✅ Search completes without crashes
2. ✅ Progress UI shows 5 phases
3. ✅ AI coordinator creates queries
4. ✅ Timeframes calculate correctly
5. ✅ List view displays events
6. ✅ Map doesn't crash

## ❌ What Needs Deploy

1. ❌ Claude event dropping (fixed in code)
2. ❌ JSON parsing errors (fixed in code)
3. ❌ All thorough search features (fixed in code)

---

## 🚀 Bottom Line

**Deploy the backend NOW** and you'll immediately see:
- More events (10 instead of 2)
- Better descriptions
- No JSON errors
- All features working

The event quality (generic titles, missing coords) requires adding better event sources (Eventbrite, Meetup, etc.) which is a next-phase improvement.

---

Generated: 2025-10-21
Status: Ready for deployment
Commit: 68ca9ea
