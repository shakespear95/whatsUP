# Claude AI Agent Deployment Guide

## Overview
Your search-events function has been updated to use Claude as an intelligent AI agent that decides which tools to use for finding real events.

## What Changed

### Before (Old System):
- Fixed workflow: Weather → Perplexity + SerpAPI (parallel) → OpenAI Enhancement
- No decision-making
- Always called the same APIs in the same order

### After (Agent System):
- **Claude orchestrates** the entire search process
- **Intelligent tool selection** - Claude decides which tools to use and when
- **Iterative reasoning** - Claude can make up to 10 tool calls
- **Better quality** - Claude synthesizes results from multiple sources

## Files Changed

✅ **Updated:** `supabase/functions/search-events/index.ts`
✅ **Backup Created:** `supabase/functions/search-events/index.backup.ts`

## Required Environment Variables

You need to add these to your Supabase project:

```bash
# REQUIRED - Claude Agent
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# REQUIRED - Search Tools (at least one)
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx
SERP_API_KEY=xxxxxxxxxxxxx

# OPTIONAL - Additional Tools
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxx
OPENWEATHER_API_KEY=xxxxxxxxxxxxx
```

## How to Deploy

### Step 1: Add API Keys to Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **Edge Functions** → **Environment Variables**
3. Add the following variables:

```
ANTHROPIC_API_KEY = your_anthropic_key_here
PERPLEXITY_API_KEY = your_perplexity_key_here
SERP_API_KEY = your_serp_api_key_here
FIRECRAWL_API_KEY = your_firecrawl_key_here (optional)
OPENWEATHER_API_KEY = your_openweather_key_here (optional)
```

### Step 2: Deploy the Function

```bash
# Navigate to project directory
cd D:\virtual\whatsUP

# Deploy search-events function
supabase functions deploy search-events
```

### Step 3: Test the Function

```bash
# Test with a simple query
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/search-events \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Zurich",
    "activity_type": "Concerts & Party",
    "timeframe": "this week"
  }'
```

## How the Agent Works

### 1. Cache Check
- First checks database for existing events (fast)
- Returns cached results if available

### 2. Agent Orchestration (if cache miss)
Claude receives your search request and decides:

**Example Agent Flow:**
```
User: "Find music events in Zurich this week"

Claude thinks: "I should:
1. Check weather conditions (outdoor events)
2. Search Perplexity for real events
3. Use Google for ticket links
4. Scrape event websites if needed"

Claude executes tools:
🌤️ weather_check → "Clear, 22°C"
🔍 perplexity_search → "Found 8 events with citations"
🔍 google_serp_search → "Found 12 more events + ticket links"
📄 firecrawl_scrape → "Extracted details from event pages"

Claude synthesizes:
"Here are 20 curated events combining all sources..."
```

### 3. Response Synthesis
Claude combines all tool results into a structured event list

### 4. Database Storage
New events are saved to cache for future searches

## Production Improvements Added

### ✅ Timeout Handling
```typescript
// 30-second timeout per tool call
await Promise.race([
  executeToolCall(toolName, input, searchData),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 30000)
  )
]);
```

### ✅ Error Recovery
```typescript
// If a tool fails, Claude receives the error and adapts
toolResults.push({
  type: 'tool_result',
  tool_use_id: toolUse.id,
  content: JSON.stringify({ error: error.message }),
  is_error: true
});
```

### ✅ Max Iterations
```typescript
// Prevents infinite loops
const maxToolCalls = 10;
```

### ✅ Graceful Degradation
- If tools fail, Claude still tries to provide results
- Missing API keys return errors instead of crashing

## Monitoring & Debugging

### View Logs
```bash
# Real-time logs
supabase functions logs search-events --follow

# Look for these messages:
# 🤖 Initializing Claude AI Agent...
# 🛠️ Claude requesting tool use (iteration 1)
# 📞 Calling tool: perplexity_search
# ✅ Claude completed tool usage
```

### Key Log Markers
- `🤖` = Agent initialization
- `🛠️` = Tool use requested
- `📞` = Tool execution
- `✅` = Success
- `❌` = Error

## Cost Estimates

### Per Search (cache miss):
- Claude API: ~$0.015-0.025 (2-5 calls @ ~$0.003-0.008 each)
- Perplexity: ~$0.001-0.003
- SerpAPI: ~$0.002-0.004
- Firecrawl: ~$0.01 (if used)
- **Total: ~$0.03-0.04 per uncached search**

### Cost Optimization:
- Cache reduces costs by 80-90% (most searches hit cache)
- Claude uses Sonnet (cheaper than Opus)
- Only tools needed are called

## Performance

### Expected Response Times:
- **Cache hit:** 200-500ms (fast)
- **Agent search:** 10-20 seconds (due to sequential tool calls + Claude reasoning)

### Why Slower?
```
Traditional: Weather (1s) → Perplexity + SERP (parallel 2s) = ~3s total
Agent: Claude think (1s) → Weather (2s) → Claude think (1s) → Perplexity (3s) → Claude think (1s) → SERP (2s) = ~10s total
```

**Trade-off:** Slower but much smarter event discovery

## Troubleshooting

### Issue: "Missing Anthropic API key"
**Solution:** Add `ANTHROPIC_API_KEY` to Supabase environment variables

### Issue: "No events found"
**Possible causes:**
1. Check logs: `supabase functions logs search-events`
2. Verify API keys are correct
3. Check if tools are returning data
4. Claude might be deciding not to use certain tools

### Issue: "Timeout errors"
**Solution:** Increase timeout in code (line 414):
```typescript
setTimeout(() => reject(new Error('timeout')), 60000) // 60 seconds
```

### Issue: "Agent loop stopped early"
**Check:** Look for tool failures in logs - Claude stops if critical tools fail

## Rollback Instructions

If you need to revert to the old system:

```bash
# Restore backup
cp supabase/functions/search-events/index.backup.ts supabase/functions/search-events/index.ts

# Redeploy
supabase functions deploy search-events
```

## Adding New Tools

To extend the agent with new capabilities:

### Example: Add Eventbrite API

1. **Define the tool** (line ~273):
```typescript
{
  name: "eventbrite_search",
  description: "Search Eventbrite for official event listings",
  input_schema: {
    type: "object",
    properties: {
      location: { type: "string" },
      category: { type: "string" }
    }
  }
}
```

2. **Implement the function** (after line 507):
```typescript
async function executeEventbriteSearch(input: any): Promise<any> {
  const EVENTBRITE_TOKEN = Deno.env.get('EVENTBRITE_TOKEN');

  const response = await fetch(
    `https://www.eventbriteapi.com/v3/events/search/?location.address=${input.location}`,
    {
      headers: { 'Authorization': `Bearer ${EVENTBRITE_TOKEN}` }
    }
  );

  const data = await response.json();
  return { success: true, events: data.events };
}
```

3. **Add to switch statement** (line ~491):
```typescript
case 'eventbrite_search':
  return await executeEventbriteSearch(toolInput);
```

Claude will automatically learn to use this new tool!

## Getting API Keys

- **Anthropic (Claude):** https://console.anthropic.com/
- **Perplexity:** https://www.perplexity.ai/settings/api
- **SerpAPI:** https://serpapi.com/manage-api-key
- **Firecrawl:** https://www.firecrawl.dev/app/api-keys
- **OpenWeather:** https://openweathermap.org/api

## Support

If you encounter issues:
1. Check Supabase function logs
2. Verify all API keys are valid
3. Test individual tools separately
4. Ensure you have credits on all API services

---

**Deployment Status:** Ready to deploy ✅
**Backup Location:** `supabase/functions/search-events/index.backup.ts`
**Next Step:** Add API keys to Supabase and deploy!
