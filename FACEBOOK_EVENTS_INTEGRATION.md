# Facebook Events Integration Research

## Overview
This document explores options for integrating Facebook Events into WhatsUP to increase event coverage and provide more results.

## ⚠️ Important Context: Facebook API Restrictions

In 2018, Facebook **deprecated public access** to the Events API after the Cambridge Analytica scandal. This significantly limits our options for programmatic event access.

### What Changed:
- **Before 2018**: Events Discovery API allowed searching for public events by location/keyword
- **After 2018**: Events API requires **app review** and only works for events the user manages or is invited to
- **Public events**: No longer accessible via official API without special permissions

## Available Options

### Option 1: Facebook Graph API (Official - Limited) ⭐
**Status**: Possible but requires app review and user permissions

**What it provides:**
- Events the authenticated user created
- Events the user is invited to or interested in
- Events from pages the user manages

**Requirements:**
- Facebook App ID and Secret
- OAuth flow for user authentication
- `user_events` permission (requires app review)
- `pages_read_engagement` for page events

**Pros:**
✅ Official API, won't break
✅ Accurate event data
✅ Real-time updates

**Cons:**
❌ No discovery of public events
❌ Requires user to log in with Facebook
❌ App review process can take weeks
❌ Only shows events user is connected to

**Implementation:**
```typescript
// Using @facebook/graph-api
const response = await fetch(
  `https://graph.facebook.com/v18.0/me/events?access_token=${userToken}`,
  { method: 'GET' }
);
```

---

### Option 2: Web Scraping (Unofficial - Grey Area) ⚠️
**Status**: Technically possible but risky

**What it provides:**
- Public events from Facebook's web interface
- Search by location and keywords
- Full event details (name, date, location, description)

**Tools:**
- Puppeteer / Playwright for browser automation
- Cheerio for HTML parsing
- Selenium with headless Chrome

**Pros:**
✅ Can access public events
✅ No user authentication required
✅ Full event discovery

**Cons:**
❌ Violates Facebook Terms of Service
❌ Can get IP banned
❌ Fragile - breaks when Facebook changes HTML
❌ Rate limiting issues
❌ Legal concerns

**Example approach:**
```typescript
// Visit facebook.com/events/search?q=concerts+zurich
// Parse HTML for event cards
// Extract event details
```

**Recommendation**: ❌ **NOT RECOMMENDED** due to TOS violations and maintenance burden

---

### Option 3: RSS Feeds from Facebook Pages ✅
**Status**: Viable for specific pages

**What it provides:**
- Events posted by specific Facebook pages
- Updates when pages create new events

**How it works:**
- Convert Facebook page URL to RSS feed
- Parse RSS feed for event announcements
- Services like `RSSHub` can help

**Pros:**
✅ Legal and within TOS
✅ Reliable for followed pages
✅ No authentication needed

**Cons:**
❌ Only works for pages you know about
❌ Not a discovery mechanism
❌ Inconsistent event data format

**Implementation:**
```typescript
// Using RSSHub or similar
const feedUrl = `https://rsshub.app/facebook/page/zurich-events`;
const feed = await parser.parseURL(feedUrl);
```

---

### Option 4: Third-Party Event APIs ⭐⭐⭐ (RECOMMENDED)
**Status**: Best alternative

Instead of scraping Facebook, use **aggregator APIs** that already include Facebook events:

#### **4a. Eventbrite API**
- Free tier available
- Well-documented API
- Includes events from various sources

```typescript
const response = await fetch(
  `https://www.eventbriteapi.com/v3/events/search/?location.address=Zurich&token=${EVENTBRITE_TOKEN}`
);
```

#### **4b. Meetup API**
- Community events and gatherings
- Many events cross-posted to Facebook

#### **4c. Eventful / Ticketmaster / Bandsintown**
- Major event aggregators
- Include Facebook events indirectly

#### **4d. SerpAPI (Already using!) 🎯**
We're already using SerpAPI - it can search Facebook events!

```typescript
// SerpAPI Facebook Events Search
const response = await fetch('https://serpapi.com/search', {
  method: 'POST',
  body: JSON.stringify({
    engine: 'facebook_events',
    q: 'concerts in Zurich',
    location: 'Zurich, Switzerland'
  }),
  headers: {
    'Authorization': `Bearer ${SERP_API_KEY}`
  }
});
```

**Pros:**
✅ Legal and compliant
✅ Already paying for SerpAPI
✅ No Facebook authentication needed
✅ Works for public events
✅ Maintained by SerpAPI team

**Cons:**
❌ Costs API credits
❌ May not get ALL Facebook events

---

### Option 5: User-Generated Content 💡
**Status**: Long-term community approach

**How it works:**
- Let users submit events they find on Facebook
- Community moderation
- Build our own event database

**Pros:**
✅ Legal and sustainable
✅ Builds community engagement
✅ No API dependencies
✅ Unique local insights

**Cons:**
❌ Requires active user base
❌ Slower to build coverage
❌ Needs moderation system

---

## Recommended Implementation Strategy

### Phase 1: SerpAPI Facebook Events (Immediate) ✅
```typescript
// Add to existing searchWithAgent function
async function searchFacebookEvents(searchData: SearchRequest) {
  const SERP_API_KEY = Deno.env.get('SERP_API_KEY');

  const response = await fetch(
    `https://serpapi.com/search.json?engine=facebook_events&q=${encodeURIComponent(searchData.activity_type + ' in ' + searchData.location)}&api_key=${SERP_API_KEY}`
  );

  const data = await response.json();
  return data.events_results || [];
}
```

### Phase 2: Eventbrite Integration (Next week)
- Sign up for Eventbrite API
- Add as parallel search source
- Merge results with existing events

### Phase 3: User Submissions (Future)
- Add "Submit Event" feature
- Allow users to share Facebook event links
- Auto-parse event details from URL

---

## Data Privacy & Legal Considerations

### ✅ Legal approaches:
1. **SerpAPI** - They handle scraping/caching legally
2. **Official APIs** with proper OAuth
3. **RSS feeds** from public pages
4. **User submissions** with consent

### ❌ Avoid:
1. Direct scraping of Facebook
2. Storing user data without permission
3. Bypassing authentication

---

## Implementation Code Example

### Adding Facebook Events via SerpAPI:

```typescript
// In search-events-agent/index.ts

async function searchFacebookEventsViaSerpAPI(searchData: SearchRequest) {
  const SERP_API_KEY = Deno.env.get('SERP_API_KEY');

  if (!SERP_API_KEY) {
    console.log('⚠️ SERP_API_KEY not configured, skipping Facebook events');
    return [];
  }

  try {
    console.log('🔍 Searching Facebook events via SerpAPI...');

    const query = `${searchData.activity_type} events in ${searchData.location}`;
    const response = await fetch(
      `https://serpapi.com/search.json?` + new URLSearchParams({
        engine: 'facebook_events',
        q: query,
        api_key: SERP_API_KEY
      })
    );

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data = await response.json();
    const events = data.events_results || [];

    console.log(`✅ Found ${events.length} Facebook events`);

    // Transform to our event format
    return events.map((event: any) => ({
      title: event.name,
      description: event.description,
      date: event.start_time,
      location: event.location?.name || searchData.location,
      address: event.location?.address || '',
      latitude: event.location?.latitude,
      longitude: event.location?.longitude,
      price: event.ticket_price || 'See Facebook',
      category: searchData.activity_type,
      ticketLink: event.link,
      venue: event.location?.name,
      special_feature: 'Posted on Facebook'
    }));

  } catch (error) {
    console.error('❌ Facebook events search error:', error);
    return [];
  }
}

// Add to searchRealEventsInParallel
const facebookEventsPromise = searchFacebookEventsViaSerpAPI(searchData);

// Merge with other results
const [serpResults, openaiResults, perplexityResults, facebookResults] = await Promise.all([
  searchWithSerpAPI(searchData, weather),
  searchWithOpenAI(searchData, weather),
  searchWithPerplexity(searchData, weather),
  facebookEventsPromise  // NEW!
]);

const allEvents = [
  ...serpResults,
  ...openaiResults,
  ...perplexityResults,
  ...facebookResults  // NEW!
];
```

---

## Next Steps

1. ✅ **Test SerpAPI Facebook Events** - Add to search pipeline
2. ⏳ **Sign up for Eventbrite API** - Supplement with another source
3. ⏳ **Monitor results** - Track how many Facebook events we get
4. ⏳ **Add user submissions** - Long-term community building

---

## Conclusion

**Recommended approach: Use SerpAPI's Facebook Events engine**

This gives us:
- ✅ Legal access to public Facebook events
- ✅ No authentication required
- ✅ Leverages existing SerpAPI subscription
- ✅ Easy to implement
- ✅ Maintained by third party

**Next best: Eventbrite + Meetup APIs**
- Complement SerpAPI results
- Free tiers available
- Official APIs

**Avoid: Direct scraping**
- Violates TOS
- Gets blocked
- Legal risk

---

Generated: 2025-10-21
For: WhatsUP Event Discovery Platform
