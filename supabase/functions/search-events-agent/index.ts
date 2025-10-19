// =====================================================
// Supabase Edge Function: search-events-agent
// AI Agent-based event search inspired by n8n workflow
// Uses Claude Sonnet 3.7 with tool calling for better results
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  location: string;
  activity_type: string;
  timeframe: string;
  budget?: string;
  keywords?: string;
  radius?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const searchData: SearchRequest = await req.json();

    console.log('🤖 Agent Search Request:', {
      location: searchData.location,
      activity_type: searchData.activity_type,
      timeframe: searchData.timeframe,
      user_id: user?.id || 'guest',
    });

    // Validate required fields
    if (!searchData.location || !searchData.activity_type || !searchData.timeframe) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Location, activity type, and timeframe are required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 1: Check cache first
    const cachedEvents = await checkEventCache(supabaseClient, searchData);

    if (cachedEvents.length > 0) {
      console.log(`✅ Cache hit: Found ${cachedEvents.length} events`);

      let userSavedEventIds: string[] = [];
      if (user) {
        userSavedEventIds = await getUserSavedEventIds(supabaseClient, user.id, cachedEvents.map(e => e.id));
      }

      if (user) {
        await saveSearchHistory(supabaseClient, user.id, searchData, cachedEvents.length, true);
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            events: cachedEvents,
            userSavedEventIds,
            totalResults: cachedEvents.length,
            cached: true,
            source: 'Database Cache',
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Cache miss - Use AI Agent
    console.log('🤖 Starting AI Agent search...');

    const agentResults = await searchWithAgent(searchData);

    // Step 3: Save to database
    if (agentResults.length > 0) {
      await saveEventsToDatabase(supabaseClient, agentResults);
    }

    // Step 4: Get user saved events
    let userSavedEventIds: string[] = [];
    if (user && agentResults.length > 0) {
      userSavedEventIds = await getUserSavedEventIds(supabaseClient, user.id, agentResults.map(e => e.id));
    }

    // Step 5: Save search history
    if (user) {
      await saveSearchHistory(supabaseClient, user.id, searchData, agentResults.length, false);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events: agentResults,
          userSavedEventIds,
          totalResults: agentResults.length,
          cached: false,
          source: 'AI Agent',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Agent Search Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// =====================================================
// AI Agent with Claude Sonnet 3.5
// =====================================================

async function searchWithAgent(searchData: SearchRequest) {
  console.log('🤖 Initializing AI Agent...');

  // Step 1: Get weather data
  const weather = await getWeatherData(searchData.location);
  console.log(`🌤️ Weather: ${weather.condition}, ${weather.temperature}°C`);

  // Step 2: Search with parallel APIs (keeping our fast approach)
  const realEvents = await searchRealEventsInParallel(searchData, weather);

  if (realEvents.length === 0) {
    console.log('⚠️ No real events found, using AI generation');
    return await generateEventsWithClaude(searchData, weather);
  }

  // Step 3: Enhance with Claude Agent
  console.log(`✅ Found ${realEvents.length} real events, enhancing with Claude Agent...`);
  const enhancedEvents = await enhanceEventsWithClaudeAgent(realEvents, searchData, weather);

  return enhancedEvents;
}

// =====================================================
// Weather Tool
// =====================================================

async function getWeatherData(location: string) {
  const WEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

  if (!WEATHER_API_KEY) {
    console.log('⚠️ No weather API key, skipping weather data');
    return {
      condition: 'unknown',
      temperature: 20,
      description: 'Weather data unavailable',
      indoor_recommended: false,
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const condition = data.weather[0].main.toLowerCase(); // rain, clear, clouds, etc.
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;

    // Determine if indoor events are recommended
    const badWeather = ['rain', 'thunderstorm', 'snow', 'drizzle'];
    const indoor_recommended = badWeather.includes(condition);

    console.log(`🌤️ Weather in ${location}: ${condition}, ${temperature}°C - ${description}`);

    return {
      condition,
      temperature,
      description,
      indoor_recommended,
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return {
      condition: 'unknown',
      temperature: 20,
      description: 'Weather data unavailable',
      indoor_recommended: false,
    };
  }
}

// =====================================================
// Enhanced Prompt (n8n style)
// =====================================================

function createAgentPrompt(searchData: SearchRequest, weather: any): string {
  return `# Expert Local Event Discovery Agent

You are a specialized event discovery expert. Your task is to find and curate the BEST local events.

## 🎯 SEARCH PARAMETERS:
- 📍 Location: ${searchData.location}
- 🎭 Event Type: ${searchData.activity_type}
- 📅 Timeframe: ${searchData.timeframe}
- 📏 Radius: ${searchData.radius || 15}km
- 🔍 Keywords: ${searchData.keywords || 'None'}
- 💰 Budget: ${searchData.budget || 'Any'}

## 🌤️ CURRENT WEATHER:
- Condition: ${weather.condition}
- Temperature: ${weather.temperature}°C
- Description: ${weather.description}
${weather.indoor_recommended ? '⚠️ Bad weather - Prioritize INDOOR events!' : '✅ Good weather - Outdoor events OK'}

## 📋 REQUIRED OUTPUT FOR EACH EVENT:
1. 🎭 **Event Name & Category**
2. 📍 **Exact Address** (street, city, postal code)
3. ⏰ **Date, Time, Duration**
4. 💰 **Price Information** (Free/Exact Price/Price Range)
5. 📝 **Description** (2-3 sentences, key highlights only)
6. 🌤️ **Venue Type** (Indoor/Outdoor/Covered)
7. ⭐ **Special Features** (What makes this event unique?)
8. 🎫 **How to Book** (Website URL, Phone, Walk-in, etc.)
9. 📊 **Source** (Where you found this information)

## 🔍 RESEARCH STRATEGY:
- Find BOTH mainstream events AND hidden local gems
- Verify events are actually happening (check dates!)
- Consider weather conditions (indoor vs outdoor)
- Prioritize events matching the exact criteria
- Include 70% reliable mainstream + 30% unique local discoveries
- Check multiple sources for accuracy

## 📊 OUTPUT STRUCTURE:
- Return JSON array of 8-15 events
- Sort by relevance and quality
- Each event must have ALL required fields
- Focus on QUALITY over QUANTITY

## ⚠️ IMPORTANT:
- NO made-up events or hallucinated details
- Real verifiable information only
- Include actual booking URLs when available
- Consider weather in recommendations

Return ONLY the JSON array, no other text.`;
}

// =====================================================
// Parallel Real Event Search (keeping our fast approach)
// =====================================================

async function searchRealEventsInParallel(searchData: SearchRequest, weather: any) {
  console.log('🔍 Searching real events (SerpAPI + Perplexity) in parallel...');

  const providers: { name: string; promise: Promise<any[]> }[] = [];

  if (Deno.env.get('SERP_API_KEY')) {
    providers.push({
      name: 'SerpAPI',
      promise: searchWithSerpAPI(searchData),
    });
  }

  if (Deno.env.get('PERPLEXITY_API_KEY')) {
    providers.push({
      name: 'Perplexity',
      promise: searchWithPerplexity(searchData, weather),
    });
  }

  if (providers.length === 0) {
    console.log('❌ No search APIs configured');
    return [];
  }

  console.log(`🚀 Running ${providers.length} search APIs in parallel...`);

  const results = await Promise.allSettled(providers.map(p => p.promise));
  const allEvents: any[] = [];

  results.forEach((result, index) => {
    const providerName = providers[index].name;

    if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
      console.log(`✅ ${providerName} found ${result.value.length} events`);
      allEvents.push(...result.value);
    } else if (result.status === 'rejected') {
      console.error(`❌ ${providerName} failed:`, result.reason);
    } else {
      console.log(`⚠️ ${providerName} returned no events`);
    }
  });

  if (allEvents.length === 0) {
    return [];
  }

  const uniqueEvents = deduplicateEvents(allEvents);
  console.log(`📊 Total unique events: ${uniqueEvents.length}`);

  return uniqueEvents.slice(0, 15);
}

// =====================================================
// Enhanced Perplexity with Weather Context
// =====================================================

async function searchWithPerplexity(searchData: SearchRequest, weather: any) {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

  // Weather-aware query
  const weatherContext = weather.indoor_recommended
    ? 'Focus on INDOOR events due to bad weather.'
    : 'Include both indoor and outdoor events.';

  const query = `Find 10 real upcoming ${searchData.activity_type} events in ${searchData.location} for ${searchData.timeframe} in 2025. ${weatherContext} Include hidden gems and local favorites. Return: event name, exact date (YYYY-MM-DD), time (HH:MM), venue name, full address, ticket price, website link, and whether it's indoor or outdoor. Return as JSON array.`;

  console.log(`🔍 Perplexity query (weather-aware): ${query.substring(0, 100)}...`);

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar', // Latest Perplexity model (fast and accurate)
      messages: [
        {
          role: 'system',
          content: 'You are an expert event finder with real-time web access. Find real, verifiable events. Include both mainstream events and hidden local gems. Always return structured JSON.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 3000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return processPerplexityResults(data.choices[0].message.content, searchData);
}

// =====================================================
// Claude Agent Enhancement
// =====================================================

async function enhanceEventsWithClaudeAgent(events: any[], searchData: SearchRequest, weather: any) {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  if (!ANTHROPIC_API_KEY) {
    console.log('⚠️ No Anthropic API key, returning unenhanced events');
    return events;
  }

  console.log(`🤖 Claude Agent enhancing ${events.length} events...`);

  const prompt = `You are an expert event curator. Below are real events found from web search.

## Your Task:
1. Enhance descriptions (make them engaging and informative)
2. Verify venue types (indoor/outdoor) based on venue names
3. Add special features that make each event unique
4. Improve booking information
5. Consider weather: ${weather.condition}, ${weather.temperature}°C
6. ${weather.indoor_recommended ? 'PRIORITIZE INDOOR events and FLAG outdoor events with weather warning' : 'Events look good for current weather'}

## Events to Enhance:
${JSON.stringify(events, null, 2)}

## Requirements:
- Keep all original data (title, date, location, ticket_link, source)
- Enhance descriptions to 2-3 engaging sentences
- Add special_feature highlighting what's unique
- ${weather.indoor_recommended ? 'Add weather_warning for outdoor events' : ''}
- Return ONLY the JSON array, no markdown or explanations

Return the enhanced events as a JSON array.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return events; // Return original events if enhancement fails
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.log('⚠️ Claude returned invalid JSON, using original events');
      return events;
    }

    const enhancedEvents = JSON.parse(jsonMatch[0]);
    console.log(`✅ Claude Agent enhanced ${enhancedEvents.length} events`);

    return enhancedEvents;
  } catch (error) {
    console.error('Claude enhancement error:', error);
    return events; // Return original events on error
  }
}

// =====================================================
// Generate Events with Claude (fallback)
// =====================================================

async function generateEventsWithClaude(searchData: SearchRequest, weather: any) {
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  if (!ANTHROPIC_API_KEY) {
    return generateMockEvents(searchData);
  }

  console.log('🤖 Generating events with Claude Agent...');

  const prompt = createAgentPrompt(searchData, weather);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const events = JSON.parse(jsonMatch[0]);

    return events.map((e: any) => ({
      ...e,
      location: searchData.location,
      category: searchData.activity_type,
      source: 'Claude Agent',
      real_event: false,
      image_url: getEventImage(searchData.activity_type),
    }));
  } catch (error) {
    console.error('Claude generation error:', error);
    return generateMockEvents(searchData);
  }
}

// =====================================================
// Helper Functions (reused from original)
// =====================================================

async function checkEventCache(supabaseClient: any, searchData: SearchRequest) {
  const { startDate, endDate } = getDateRange(searchData.timeframe);

  const { data, error } = await supabaseClient
    .from('events')
    .select('*')
    .ilike('location', `%${searchData.location}%`)
    .eq('category', searchData.activity_type)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Cache check error:', error);
    return [];
  }

  return data || [];
}

async function getUserSavedEventIds(supabaseClient: any, userId: string, eventIds: string[]) {
  if (eventIds.length === 0) return [];

  const { data, error } = await supabaseClient
    .from('user_saved_events')
    .select('event_id')
    .eq('user_id', userId)
    .in('event_id', eventIds);

  if (error) {
    console.error('Error fetching saved events:', error);
    return [];
  }

  return (data || []).map((item: any) => item.event_id);
}

async function saveSearchHistory(
  supabaseClient: any,
  userId: string,
  searchData: SearchRequest,
  resultsCount: number,
  cacheHit: boolean
) {
  const { error } = await supabaseClient.from('search_history').insert({
    user_id: userId,
    location: searchData.location,
    activity_type: searchData.activity_type,
    timeframe: searchData.timeframe,
    keywords: searchData.keywords,
    budget: searchData.budget,
    radius: searchData.radius,
    results_count: resultsCount,
    cache_hit: cacheHit,
  });

  if (error) {
    console.error('Error saving search history:', error);
  }
}

async function saveEventsToDatabase(supabaseClient: any, events: any[]) {
  const { error } = await supabaseClient.from('events').insert(events).select();

  if (error && !error.message.includes('duplicate key')) {
    console.error('Error saving events:', error);
  } else {
    console.log(`✅ Saved ${events.length} events to database`);
  }
}

// Import remaining utility functions from original search-events
async function searchWithSerpAPI(searchData: SearchRequest) {
  const SERP_API_KEY = Deno.env.get('SERP_API_KEY');
  // Add "hidden gems" and "local favorites" to query
  const query = `"${searchData.activity_type}" events "${searchData.location}" ${searchData.timeframe} 2025 tickets "hidden gems" OR "local favorites"`;

  console.log(`🔍 SerpAPI query (enhanced): ${query}`);

  const response = await fetch(
    `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}&num=20`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SerpAPI error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return processSerpResults(data, searchData);
}

function processSerpResults(serpData: any, searchData: SearchRequest) {
  const events: any[] = [];

  if (serpData.organic_results) {
    serpData.organic_results.slice(0, 10).forEach((result: any, index: number) => {
      if (result.title && result.snippet) {
        events.push({
          title: cleanEventTitle(result.title),
          description: result.snippet,
          date: getDateInTimeframe(searchData.timeframe, index),
          time: getRandomTime(),
          location: searchData.location,
          venue: extractVenue(result.title, searchData.location),
          address: `${searchData.location} - See website`,
          price: extractPrice(result.snippet) || 'See website',
          category: searchData.activity_type,
          special_feature: 'Real event from web search',
          organizer: 'Event Organizer',
          capacity: 'See website',
          tags: [searchData.activity_type.toLowerCase(), 'real-event'],
          ticket_link: result.link || null,
          source: 'SerpAPI',
          real_event: true,
          image_url: getEventImage(searchData.activity_type),
        });
      }
    });
  }

  console.log(`📊 SerpAPI processed ${events.length} events`);
  return events;
}

function processPerplexityResults(content: string, searchData: SearchRequest) {
  const events: any[] = [];

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsedEvents = JSON.parse(jsonMatch[0]);
      const eventArray = Array.isArray(parsedEvents) ? parsedEvents : [parsedEvents];

      eventArray.forEach((event: any) => {
        events.push({
          title: cleanEventTitle(event.title || event.name || 'Event'),
          description: event.description || `${searchData.activity_type} event in ${searchData.location}`,
          date: event.date || getDateInTimeframe(searchData.timeframe, 0),
          time: event.time || getRandomTime(),
          location: searchData.location,
          venue: event.venue || `${searchData.location} Venue`,
          address: event.address || searchData.location,
          price: event.price || 'See website',
          category: searchData.activity_type,
          special_feature: 'Real event from web search',
          organizer: event.organizer || 'Event Organizer',
          capacity: 'See website',
          tags: [searchData.activity_type.toLowerCase(), 'real-event'],
          ticket_link: event.website || event.url || null,
          source: 'Perplexity',
          real_event: true,
          image_url: getEventImage(searchData.activity_type),
        });
      });
    }
  } catch (error) {
    console.error('Error parsing Perplexity results:', error);
  }

  console.log(`📊 Perplexity processed ${events.length} events`);
  return events.slice(0, 10);
}

function generateMockEvents(searchData: SearchRequest): any[] {
  const events = [];
  for (let i = 0; i < 5; i++) {
    events.push({
      title: `${searchData.activity_type} Event ${i + 1}`,
      description: `Exciting ${searchData.activity_type} event in ${searchData.location}`,
      date: getDateInTimeframe(searchData.timeframe, i),
      time: getRandomTime(),
      location: searchData.location,
      venue: `${searchData.location} Venue ${i + 1}`,
      address: `${i + 1} Main St, ${searchData.location}`,
      price: '$20-40',
      category: searchData.activity_type,
      special_feature: 'Mock event for testing',
      source: 'Mock Data',
      real_event: false,
      image_url: getEventImage(searchData.activity_type),
    });
  }
  return events;
}

// Utility functions
function getDateRange(timeframe: string) {
  const now = new Date();
  let startDate = new Date(now);
  let endDate = new Date(now);

  switch (timeframe.toLowerCase()) {
    case 'today':
      endDate.setHours(23, 59, 59);
      break;
    case 'this week':
      endDate.setDate(now.getDate() + 7);
      break;
    case 'next week':
      startDate.setDate(now.getDate() + 7);
      endDate.setDate(now.getDate() + 14);
      break;
    case 'this month':
      endDate.setMonth(now.getMonth() + 1);
      break;
    case 'next month':
      startDate.setMonth(now.getMonth() + 1);
      endDate.setMonth(now.getMonth() + 2);
      break;
    default:
      endDate.setDate(now.getDate() + 30);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

function getDateInTimeframe(timeframe: string, offset: number): string {
  const now = new Date();
  const date = new Date(now);

  switch (timeframe.toLowerCase()) {
    case 'today':
      date.setHours(date.getHours() + offset * 2);
      break;
    case 'this week':
      date.setDate(now.getDate() + offset);
      break;
    case 'next week':
      date.setDate(now.getDate() + 7 + offset);
      break;
    case 'this month':
      date.setDate(now.getDate() + offset * 3);
      break;
    case 'next month':
      date.setMonth(now.getMonth() + 1);
      date.setDate(offset * 4 + 1);
      break;
    default:
      date.setDate(now.getDate() + offset * 2);
  }

  return date.toISOString().split('T')[0];
}

function getRandomTime(): string {
  const hours = Math.floor(Math.random() * 12) + 10;
  const minutes = Math.random() < 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function extractVenue(title: string, location: string): string {
  const venuePattern = /(at|@)\s+([^-,]+)/i;
  const match = title.match(venuePattern);
  return match ? match[2].trim() : `${location} Venue`;
}

function extractPrice(snippet: string): string | null {
  const pricePatterns = [/\$\d+(?:-\$?\d+)?/, /free/i, /€\d+(?:-€?\d+)?/, /£\d+(?:-£?\d+)?/];
  for (const pattern of pricePatterns) {
    const match = snippet.match(pattern);
    if (match) return match[0];
  }
  return null;
}

function deduplicateEvents(events: any[]): any[] {
  const seen = new Set();
  return events.filter((event) => {
    const key = `${event.title}-${event.date}-${event.venue}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function cleanEventTitle(title: string): string {
  return title
    .replace(/\s*-\s*Eventbrite.*$/i, '')
    .replace(/\s*\|\s*Tickets.*$/i, '')
    .replace(/\s*-\s*Ticketmaster.*$/i, '')
    .replace(/\s*-\s*Buy Tickets.*$/i, '')
    .trim();
}

function getEventImage(category: string): string {
  const imageMap: Record<string, string> = {
    'Concerts & Party': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    'Stage & Theater': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    'Art & Museums': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    'Sports & Recreation': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'Food & Culinary': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'Knowledge & Business': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
  };
  return imageMap[category] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
}
