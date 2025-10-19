# n8n Workflow Integration - Improvements for EventFinder

## Overview
Based on the n8n workflow analysis (`WhatsUP-AWS-01 (1).json`), here are the key improvements we can implement to enhance our search results.

## Current n8n Workflow Architecture

### Key Components:
1. **AI Agent**: Claude 3.7 Sonnet with extended thinking (16K tokens)
2. **Research Tools**:
   - Perplexity Sonar (Deep web search)
   - OpenWeatherMap API (Weather intelligence)
   - Google Maps API (Geolocation)

### Workflow Strengths:
- **Extended Thinking**: Claude 3.7 with thinking mode for better reasoning
- **Multi-Source Research**: Combines mainstream + niche + community sources
- **Weather Intelligence**: Considers weather impact on event recommendations
- **Geographic Precision**: Exact coordinates for distance calculation
- **Hidden Gems Discovery**: 70% reliable events + 30% hidden gems strategy

## Improvements We Can Implement

### 1. ✅ **Enhanced Perplexity Queries** (IMPLEMENTED)
**What we did:**
- Added current date context to avoid past events
- Included weather-awareness in queries
- Emphasized FUTURE dates explicitly
- Added request for official website links

**Code Location:** `supabase/functions/search-events/index.ts:429-440`

### 2. ✅ **Date Generation Fix** (IMPLEMENTED)
**What we did:**
- Ensured all generated dates are in the future
- Added validation to prevent past dates
- Improved date distribution logic

**Code Location:** `supabase/functions/search-events/index.ts:824-859`

### 3. ✅ **Category Mapping** (IMPLEMENTED)
**What we did:**
- Created German to English category mapping
- Combined categories and subcategories into keywords
- Pass all selected filters to the search

**Code Location:** `src/App.tsx:118-154`

### 4. 🚀 **Recommended: Add Claude Agent Layer**
**What it does:**
- Intelligent filtering and prioritization of results
- Quality scoring of events
- Hidden gems discovery
- Context-aware recommendations

**Implementation:**
```typescript
// Add to search-events function
async function enhanceWithClaudeAgent(events: any[], searchData: SearchRequest, weather: any) {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  const prompt = `You are an expert event curator. Analyze these ${events.length} events and:

  1. Filter out low-quality or outdated events
  2. Identify hidden gems and unique experiences
  3. Score each event by relevance (1-10)
  4. Consider weather: ${weather.condition} (${weather.temperature}°C)
  5. Prioritize weather-appropriate events

  Search Context:
  - Location: ${searchData.location}
  - Activity: ${searchData.activity_type}
  - Timeframe: ${searchData.timeframe}
  - Weather: ${weather.indoor_recommended ? 'Bad weather - prioritize indoor' : 'Good weather'}

  Events to analyze:
  ${JSON.stringify(events, null, 2)}

  Return JSON array with enhanced events, sorted by relevance score (highest first).
  Add fields: relevance_score (1-10), quality_tier ('mainstream'|'hidden_gem'|'exclusive'),
  weather_appropriate (boolean), agent_recommendation (string).`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 8000
      },
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  const data = await response.json();
  const content = data.content.find((c: any) => c.type === 'text')?.text;

  try {
    const enhanced = JSON.parse(content);
    return enhanced.slice(0, 12); // Return top 12 events
  } catch {
    return events; // Fallback to original
  }
}
```

**Where to add:** After `searchRealEventsInParallel` in `supabase/functions/search-events/index.ts:243`

### 5. 🚀 **Recommended: Structured Output Format**
Match the n8n workflow's rich output format:

```typescript
interface EnhancedEvent {
  // Basic Info
  title: string;
  category: string;

  // Location (from n8n: Exakte Adresse & Entfernung)
  exact_address: string;
  distance_km: number;
  coordinates: { lat: number; lng: number };

  // Timing (from n8n: Datum, Uhrzeit, Dauer)
  date: string;
  time: string;
  duration_hours?: number;

  // Pricing (from n8n: Preisinformation)
  price_type: 'free' | 'fixed' | 'range';
  price_min?: number;
  price_max?: number;
  currency: string;

  // Description (from n8n: 2-3 Sätze, Highlights)
  short_description: string;
  highlights: string[];

  // Weather (from n8n: Indoor/Outdoor/Überdacht)
  weather_dependency: 'indoor' | 'outdoor' | 'covered';
  weather_appropriate: boolean;

  // Unique Features (from n8n: Besonderheiten)
  special_features: string[];
  quality_tier: 'mainstream' | 'hidden_gem' | 'exclusive';

  // Booking (from n8n: Website, Telefon, Walk-in)
  booking_method: 'website' | 'phone' | 'walkin' | 'multiple';
  booking_url?: string;
  booking_phone?: string;

  // Source (from n8n: Wo gefunden, Verifikation)
  source: string;
  source_url: string;
  verified: boolean;
  last_updated: string;

  // AI Metadata
  relevance_score: number; // 1-10
  agent_recommendation: string;
}
```

### 6. 🚀 **Recommended: Add Google Maps Distance Calculation**
Calculate exact distances from search location:

```typescript
async function calculateDistances(events: any[], searchLocation: string) {
  const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

  // Get coordinates for search location
  const originCoords = await geocodeLocation(searchLocation);

  // Calculate distance for each event
  for (const event of events) {
    if (event.latitude && event.longitude) {
      const distance = haversineDistance(
        originCoords.lat, originCoords.lng,
        event.latitude, event.longitude
      );
      event.distance_km = Math.round(distance * 10) / 10; // Round to 1 decimal
    }
  }

  // Sort by distance
  return events.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### 7. 🚀 **Recommended: HTML Formatting for Email**
If you plan to send email notifications (like n8n does):

```typescript
function formatEventsToHTML(events: any[]): string {
  return `
    <div class="event-results">
      <style>
        .event-card {
          border-left: 3px solid #667eea;
          padding: 12px;
          margin: 12px 0;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .event-title { color: #667eea; font-size: 1.3em; }
        .event-meta { color: #6c757d; font-size: 0.9em; }
      </style>
      ${events.map(event => `
        <div class="event-card">
          <h3 class="event-title">🎭 ${event.title}</h3>
          <p class="event-meta">📍 ${event.location} (${event.distance_km}km)</p>
          <p class="event-meta">📅 ${event.date} ⏰ ${event.time}</p>
          <p class="event-meta">💰 ${event.price}</p>
          <p>${event.description}</p>
          ${event.special_features ? `<p>⭐ ${event.special_features}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}
```

## Priority Implementation Order

### Phase 1: ✅ COMPLETED
1. ✅ Fix date generation to prevent past dates
2. ✅ Enhance Perplexity queries with date context
3. ✅ Fix category mapping and keyword combination
4. ✅ Fix ticket button styling

### Phase 2: 🚀 RECOMMENDED (High Impact)
1. **Add Claude Agent Enhancement Layer** - Most impactful
   - Better quality filtering
   - Hidden gems discovery
   - Weather-aware prioritization

2. **Add Distance Calculation**
   - Show exact distances
   - Sort by proximity
   - Filter by radius

3. **Structured Event Output**
   - Richer event metadata
   - Better booking information
   - Quality tiers

### Phase 3: 🔮 FUTURE ENHANCEMENTS
1. Email notifications with HTML formatting
2. User preferences learning
3. Event history and recommendations
4. Community ratings integration

## Cost Comparison: n8n vs Current

### n8n Workflow Cost (per search):
- Claude 3.7 Sonnet (16K tokens): ~$0.40
- Perplexity Sonar: ~$0.01
- OpenWeatherMap: FREE
- Google Maps API: ~$0.005
- **Total: ~$0.42 per search**

### Current Implementation (per search):
- SerpAPI: ~$0.05
- Perplexity Sonar: ~$0.01
- OpenAI GPT-4o-mini: ~$0.003
- OpenWeatherMap: FREE
- **Total: ~$0.06 per search**

### With Claude Agent Addition:
- Current stack: ~$0.06
- Claude 3.7 Enhancement: ~$0.40
- **Total: ~$0.46 per search**

**Recommendation:** Implement Claude Agent as optional tier:
- **Basic Search**: $0.06 (current)
- **Premium Search**: $0.46 (with Claude Agent)
- Users can choose quality vs cost

## Testing the Improvements

### Test Case 1: Date Validation
```bash
# Search should return only future events
curl -X POST https://ozezwaqtumofuybazkvo.supabase.co/functions/v1/search-events \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Zürich",
    "activity_type": "Concerts",
    "timeframe": "this week"
  }'

# Check all dates are >= today
```

### Test Case 2: Category Mapping
```bash
# German categories should map correctly
# Frontend: "konzerte" → Backend: "Concerts & Music"
# Check logs for proper mapping
```

### Test Case 3: Perplexity Quality
```bash
# Verify Perplexity returns recent, real events
# Check for:
# - Valid ticket links
# - Accurate dates
# - Real venues
```

## Monitoring & Logs

Add these log markers to track improvements:

```typescript
console.log('🎯 Search Quality Metrics:', {
  total_events: events.length,
  real_events: events.filter(e => e.real_event).length,
  with_tickets: events.filter(e => e.ticket_link).length,
  hidden_gems: events.filter(e => e.quality_tier === 'hidden_gem').length,
  weather_appropriate: events.filter(e => e.weather_appropriate).length,
  avg_relevance: events.reduce((sum, e) => sum + (e.relevance_score || 0), 0) / events.length
});
```

## Summary

✅ **Completed Fixes:**
1. Date generation ensures future dates
2. Perplexity queries include date context
3. Category mapping handles German UI
4. Ticket button styling fixed

🚀 **Next High-Impact Steps:**
1. Add Claude Agent layer for quality boost
2. Implement distance calculation
3. Enhance event metadata structure

💰 **Cost vs Quality Trade-off:**
- Current: Fast & cheap ($0.06/search)
- With Agent: Slower & expensive ($0.46/search) but much higher quality
- **Recommendation**: Offer both as Basic/Premium tiers
