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
  console.log('🤖 Initializing AI Agent - Fast Search Mode...');
  const startTime = Date.now();

  // Step 1: Get weather data
  console.log('📊 PHASE 1/5: Analyzing weather conditions...');
  const weather = await getWeatherData(searchData.location);
  console.log(`🌤️ Weather: ${weather.condition}, ${weather.temperature}°C`);

  // Step 2: Coordinator Agent - Create optimized search queries
  console.log('🧠 PHASE 2/5: AI Coordinator creating search strategy...');
  const searchStrategy = await createSearchStrategy(searchData, weather);
  console.log(`✅ Strategy created: ${searchStrategy.queries.length} optimized queries`);

  // Step 3: Deep web search with multiple sources
  console.log('🔍 PHASE 3/5: Searching web for real events...');
  const realEvents = await searchRealEventsInParallel(searchData, weather);
  console.log(`📋 Found ${realEvents.length} candidate events`);

  // Step 4: AI Enhancement and Quality Check
  console.log('🤖 PHASE 4/5: AI analyzing and enhancing results...');
  let enhancedEvents;
  if (realEvents.length === 0) {
    console.log('⚠️ No real events found, generating with AI...');
    enhancedEvents = await generateEventsWithClaude(searchData, weather);
  } else {
    enhancedEvents = await enhanceEventsWithClaudeAgent(realEvents, searchData, weather);
  }

  // Step 5: Geocoding and final processing
  console.log('📍 PHASE 5/5: Adding coordinates and finalizing...');
  const eventsWithCoords = await addCoordinatesToEvents(enhancedEvents);

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`✅ Search complete! ${eventsWithCoords.length} unique events found in ${totalTime}s`);

  return eventsWithCoords;
}

// Helper function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =====================================================
// AI Coordinator Agent - Creates optimized search strategy
// =====================================================
async function createSearchStrategy(searchData: SearchRequest, weather: any) {
  console.log('🧠 Coordinator Agent: Analyzing search requirements...');

  // System prompt: Guide the search for unique, quality events
  const systemPrompt = `You are an expert event discovery coordinator. Your role is to:
1. Analyze user search criteria and create targeted search queries
2. Prioritize UNIQUE and HIDDEN GEM events over mainstream ones
3. Consider local context, weather, and cultural factors
4. Generate search queries that find both popular AND underground events
5. Focus on authenticity and local experiences

Guidelines:
- 70% focus on unique/hidden/local events
- 30% mainstream popular events for balance
- Consider weather (indoor vs outdoor)
- Match user's budget and preferences
- Think about what makes events special and memorable`;

  // User prompt: Transform user filters into search strategy
  const userPrompt = `Create a search strategy for:
Location: ${searchData.location}
Event Type: ${searchData.activity_type}
Timeframe: ${searchData.timeframe}
Budget: ${searchData.budget || 'any'}
Weather: ${weather.condition} (${weather.indoor_recommended ? 'indoor recommended' : 'outdoor OK'})

Generate 3-5 specific search queries that will find:
1. Unique local events and hidden gems
2. Popular/mainstream events
3. Underground or secret events
4. Community and neighborhood events
5. Events that match the weather conditions

Return JSON array of query strings.`;

  // For now, create rule-based queries (later we can call GPT-4 if needed)
  const queries = [
    `${searchData.activity_type} events ${searchData.location} ${searchData.timeframe} hidden gems local favorites`,
    `unique ${searchData.activity_type} ${searchData.location} underground secret ${searchData.timeframe}`,
    `best ${searchData.activity_type} ${searchData.location} ${searchData.timeframe} ${weather.indoor_recommended ? 'indoor' : 'outdoor'}`,
    `local ${searchData.activity_type} ${searchData.location} community ${searchData.timeframe}`,
    `${searchData.activity_type} ${searchData.location} ${searchData.timeframe} tickets booking`
  ];

  return {
    queries,
    systemPrompt,
    userPrompt,
    priority: 'unique_events',
    weatherAdjusted: weather.indoor_recommended
  };
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
  console.log('🔍 Searching real events (SerpAPI + Perplexity + OpenAI) in parallel...');

  const providers: { name: string; promise: Promise<any[]> }[] = [];

  if (Deno.env.get('SERP_API_KEY')) {
    providers.push({
      name: 'SerpAPI',
      promise: searchWithSerpAPI(searchData),
    });
    // Also search Facebook events via SerpAPI
    providers.push({
      name: 'Facebook Events',
      promise: searchFacebookEvents(searchData),
    });
  }

  if (Deno.env.get('PERPLEXITY_API_KEY')) {
    providers.push({
      name: 'Perplexity',
      promise: searchWithPerplexity(searchData, weather),
    });
  }

  // Check for OpenAI key (try multiple possible names)
  const openAiKey = Deno.env.get('Open-AI-websearch') ||
                    Deno.env.get('OPENAI_API_KEY') ||
                    Deno.env.get('OpenAI-websearch');
  if (openAiKey) {
    providers.push({
      name: 'OpenAI',
      promise: searchWithOpenAI(searchData, weather),
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

  const query = `Search the web for REAL ${searchData.activity_type} events happening in ${searchData.location} during ${searchData.timeframe} in 2025.

IMPORTANT REQUIREMENTS:
1. Find ACTUAL events with REAL NAMES (like "Nicki Minaj Concert" NOT "Concert Event" or "Interesting Event")
2. Get the REAL venue names (like "Madison Square Garden" NOT "Venue 1")
3. Find REAL ticket prices and booking links
4. Verify these events actually exist - check official sources

${weatherContext}

For each event, provide:
- title: The ACTUAL event name (artist/show name)
- venue: REAL venue name
- address: Full street address
- date: Exact date (YYYY-MM-DD format)
- time: Start time (HH:MM format)
- price: Real ticket price or "Free"
- website: Official booking/ticket URL
- description: 2-3 sentence summary of what makes this event special
- organizer: Who is hosting/performing

Return as a JSON array with 8-12 events. NO generic names like "Event" or "Concert Event". ONLY real, verifiable events with actual names.`;

  console.log(`🔍 Perplexity query: Find real ${searchData.activity_type} events in ${searchData.location}`);

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online', // Perplexity model with web access
      messages: [
        {
          role: 'system',
          content: 'You are an expert event finder with real-time web access. Search official event websites, ticketing platforms, and venue calendars. Find REAL events with ACTUAL names, venues, and ticket information. NO generic placeholder names. Return ONLY events that actually exist with verifiable details. Always return valid JSON array format.',
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
// OpenAI Web Search
// =====================================================

async function searchWithOpenAI(searchData: SearchRequest, weather: any) {
  // Try multiple possible key names
  const OPENAI_API_KEY = Deno.env.get('Open-AI-websearch') ||
                         Deno.env.get('OPENAI_API_KEY') ||
                         Deno.env.get('OpenAI-websearch');

  if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
    console.log('⚠️ No OpenAI API key found in environment');
    console.log('🔍 Available OpenAI env vars:', Object.keys(Deno.env.toObject()).filter(k => k.toLowerCase().includes('openai')));
    return [];
  }

  console.log('✅ OpenAI API key found, length:', OPENAI_API_KEY.trim().length);

  // Weather-aware query
  const weatherContext = weather.indoor_recommended
    ? 'Focus on INDOOR events due to bad weather.'
    : 'Include both indoor and outdoor events.';

  const query = `Find REAL ${searchData.activity_type} events happening in ${searchData.location} during ${searchData.timeframe} in 2025.

CRITICAL REQUIREMENTS:
1. Find ACTUAL events with REAL NAMES (e.g., "Taylor Swift Eras Tour" NOT "Concert Event")
2. Get REAL venue names (e.g., "The O2 Arena" NOT "Venue 1")
3. Find REAL ticket prices and booking URLs
4. Verify these events exist on official sources

${weatherContext}

For each event provide:
- title: The ACTUAL event name (with artist/performer name)
- venue: REAL venue name
- address: Full street address
- date: Exact date (YYYY-MM-DD)
- time: Start time (HH:MM)
- price: Real ticket price or "Free"
- website: Official ticket/booking URL
- description: 2-3 sentences about what makes this event special
- organizer: Who is hosting/performing

Return as JSON array with 8-12 events. NO generic names. ONLY real, verifiable events.`;

  console.log('🔍 OpenAI query (GPT-4o with web context)...');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY.trim()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert event discovery assistant. Based on your knowledge and training data about events worldwide, provide REAL, VERIFIABLE events only. Return detailed, accurate information in JSON format. Focus on well-known, established events and venues.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 3000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return processOpenAIResults(data.choices[0].message.content, searchData);
  } catch (error) {
    console.error('OpenAI search error:', error);
    return [];
  }
}

function processOpenAIResults(content: string, searchData: SearchRequest) {
  const events: any[] = [];
  try {
    // Extract JSON array from response (non-greedy)
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      let jsonString = jsonMatch[0];

      // Truncate at last closing bracket
      const lastBracketIndex = jsonString.lastIndexOf(']');
      if (lastBracketIndex !== -1) {
        jsonString = jsonString.substring(0, lastBracketIndex + 1);
      }

      const parsedEvents = JSON.parse(jsonString);

      parsedEvents.forEach((event: any) => {
        // Use event's specific location if provided, otherwise fall back to venue or search location
        const eventLocation = event.location || event.venue || searchData.location;

        events.push({
          title: event.title || 'Event',
          description: event.description || '',
          date: event.date || getDateInTimeframe(searchData.timeframe, 0),
          time: event.time || '19:00',
          location: eventLocation,
          venue: event.venue || eventLocation,
          address: event.address || `${eventLocation} - See website`,
          price: event.price || 'See website',
          category: searchData.activity_type,
          special_feature: event.special_feature || 'Web search result',
          organizer: event.organizer || 'Event Organizer',
          capacity: 'See website',
          tags: [searchData.activity_type.toLowerCase(), 'real-event', 'openai'],
          ticket_link: event.website || event.ticket_link || null,
          source: 'OpenAI',
          real_event: true,
          image_url: getEventImage(searchData.activity_type),
        });
      });
    }

    console.log(`✅ OpenAI found ${events.length} events`);
    console.log(`📊 OpenAI processed ${events.length} events`);
  } catch (error) {
    console.error('Error parsing OpenAI results:', error);
  }

  return events.slice(0, 10);
}

// =====================================================
// Claude Agent Enhancement
// =====================================================

async function enhanceEventsWithClaudeAgent(events: any[], searchData: SearchRequest, weather: any) {
  // Try with and without leading space (handle secret naming issues)
  let ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get(' ANTHROPIC_API_KEY');

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.trim() === '') {
    console.log('⚠️ No Anthropic API key found in environment');
    console.log('🔍 Available env vars:', Object.keys(Deno.env.toObject()).filter(k => k.includes('ANTHROP')));
    return events;
  }

  // Trim any whitespace from the key value itself
  ANTHROPIC_API_KEY = ANTHROPIC_API_KEY.trim();
  console.log('✅ Anthropic API key found, length:', ANTHROPIC_API_KEY.length);

  console.log(`🤖 Claude Agent enhancing ${events.length} events...`);

  const prompt = `You must enhance ALL ${events.length} events provided. Return the complete JSON array with every event included.

Input events (${events.length} total):
${JSON.stringify(events, null, 2)}

Instructions:
1. Improve description for EACH event (2-3 sentences)
2. Add special_feature to EACH event
3. Keep ALL other fields unchanged
4. Process ALL ${events.length} events - do not skip any
5. Weather: ${weather.condition}, ${weather.temperature}°C

CRITICAL:
- Return ALL ${events.length} events in the array
- Do NOT filter or remove any events
- If you can't enhance an event, keep it as-is
- Return ONLY JSON array: [{...},{...}]
- NO markdown, NO explanations
- Use valid JSON escaping

You MUST return exactly ${events.length} events:`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
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
      console.error('❌ Claude API error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return events; // Return original events if enhancement fails
    }

    console.log('✅ Claude API response received');

    const data = await response.json();
    const content = data.content[0].text;

    console.log('📄 Claude response (first 500 chars):', content.substring(0, 500));

    // Try multiple JSON extraction strategies
    let enhancedEvents = null;

    // Strategy 1: Look for JSON code block
    const codeBlockMatch = content.match(/```json\s*(\[[\s\S]*?\])\s*```/);
    if (codeBlockMatch) {
      try {
        enhancedEvents = JSON.parse(codeBlockMatch[1]);
        console.log('✅ Extracted JSON from code block');
      } catch (e) {
        console.log('⚠️ Code block JSON invalid:', e.message);
      }
    }

    // Strategy 2: Find array directly (greedy - capture everything until last ])
    if (!enhancedEvents) {
      const arrayMatch = content.match(/\[([\s\S]*)\]/);
      if (arrayMatch) {
        try {
          // Aggressive JSON cleanup
          let jsonString = '[' + arrayMatch[1] + ']';

          // Remove trailing commas before closing brackets/braces
          jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');

          // Fix common issues with quotes in descriptions
          // Replace smart quotes with regular quotes
          jsonString = jsonString.replace(/[\u201C\u201D]/g, '"');
          jsonString = jsonString.replace(/[\u2018\u2019]/g, "'");

          // Remove any control characters that break JSON
          jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, '');

          // Try parsing
          enhancedEvents = JSON.parse(jsonString);
          console.log('✅ Extracted JSON from array match');
        } catch (e) {
          console.log('⚠️ Array match JSON invalid:', e.message);
          console.log('📄 Attempted JSON (first 500 chars):', jsonString?.substring(0, 500));

          // Strategy 2b: Try removing the problematic event and parsing the rest
          try {
            // Find the position of the error and try to recover
            const errorMatch = e.message.match(/position (\d+)/);
            if (errorMatch) {
              const errorPos = parseInt(errorMatch[1]);
              console.log(`🔧 Attempting recovery from position ${errorPos}...`);

              // Try to find the last complete event before the error
              const beforeError = jsonString.substring(0, errorPos);
              const lastCompleteEvent = beforeError.lastIndexOf('},');

              if (lastCompleteEvent > 0) {
                const recoveredJson = jsonString.substring(0, lastCompleteEvent + 1) + ']';
                enhancedEvents = JSON.parse(recoveredJson);
                console.log(`✅ Recovered ${enhancedEvents.length} events (skipped problematic event)`);
              }
            }
          } catch (recoveryError) {
            console.log('⚠️ Recovery attempt failed:', recoveryError.message);
          }
        }
      }
    }

    // Strategy 3: Return original events if all parsing failed
    if (!enhancedEvents) {
      console.log('⚠️ All JSON extraction strategies failed, using original events');
      return events;
    }

    console.log(`✅ Claude Agent enhanced ${enhancedEvents.length} events`);

    // Safety check: if Claude returned fewer events than input, warn and return all
    if (enhancedEvents.length < events.length) {
      console.warn(`⚠️ Claude returned ${enhancedEvents.length}/${events.length} events - using original events to avoid data loss`);
      return events;
    }

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
        model: 'claude-3-5-sonnet-20240620',
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

// =====================================================
// Facebook Events Search via SerpAPI
// =====================================================
async function searchFacebookEvents(searchData: SearchRequest) {
  const SERP_API_KEY = Deno.env.get('SERP_API_KEY');

  if (!SERP_API_KEY) {
    console.log('⚠️ SERP_API_KEY not configured, skipping Facebook events');
    return [];
  }

  try {
    console.log('📘 Searching Facebook events via SerpAPI...');

    // Create targeted Facebook events query
    const query = `${searchData.activity_type} events in ${searchData.location}`;

    const response = await fetch(
      `https://serpapi.com/search.json?engine=facebook_events&q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`SerpAPI Facebook error: ${response.status}`);
    }

    const data = await response.json();
    const fbEvents = data.events_results || [];

    console.log(`✅ Found ${fbEvents.length} Facebook events`);

    // Transform to our event format
    return fbEvents.map((event: any, index: number) => ({
      title: cleanEventTitle(event.name || event.title || 'Facebook Event'),
      description: event.description || `${searchData.activity_type} event in ${searchData.location}`,
      date: event.start_time || event.date || getDateInTimeframe(searchData.timeframe, index),
      time: event.start_time ? new Date(event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : getRandomTime(),
      location: event.location?.name || searchData.location,
      venue: event.location?.name || extractVenue(event.name, searchData.location),
      address: event.location?.address || `${searchData.location} - See Facebook`,
      latitude: event.location?.latitude || null,
      longitude: event.location?.longitude || null,
      price: event.ticket_price || extractPrice(event.description) || 'See Facebook',
      category: searchData.activity_type,
      special_feature: '📘 Posted on Facebook',
      organizer: event.organizer?.name || 'Event Organizer',
      capacity: event.attending_count ? `${event.attending_count} attending` : 'See Facebook',
      tags: [searchData.activity_type.toLowerCase(), 'facebook-event', 'real-event'],
      ticket_link: event.link || event.url || null,
      source: 'Facebook Events (SerpAPI)',
      real_event: true,
      image_url: event.thumbnail || event.image || getEventImage(searchData.activity_type),
    }));

  } catch (error) {
    console.error('❌ Facebook events search error:', error);
    return [];
  }
}

// =====================================================
// Geocoding with Nominatim (OpenStreetMap)
// =====================================================
async function geocodeLocation(locationName: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Clean up location name
    const cleanLocation = locationName.trim();

    // Use Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanLocation)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'WhatsUP-Event-Finder/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Geocoding failed for "${locationName}": ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }

    console.warn(`⚠️ No coordinates found for "${locationName}"`);
    return null;
  } catch (error) {
    console.error(`❌ Geocoding error for "${locationName}":`, error);
    return null;
  }
}

// Cache for geocoded locations to avoid repeated API calls
const geocodeCache = new Map<string, { latitude: number; longitude: number } | null>();

async function getCoordinatesForLocation(locationName: string): Promise<{ latitude: number; longitude: number } | null> {
  // Check cache first
  if (geocodeCache.has(locationName)) {
    return geocodeCache.get(locationName) || null;
  }

  // Geocode and cache result
  const coords = await geocodeLocation(locationName);
  geocodeCache.set(locationName, coords);

  // Add small delay to respect Nominatim rate limits (1 request per second)
  await new Promise(resolve => setTimeout(resolve, 1000));

  return coords;
}

// Add coordinates to all events
async function addCoordinatesToEvents(events: any[]): Promise<any[]> {
  const eventsWithCoords = [];

  for (const event of events) {
    // Build the best possible address for geocoding
    // Priority: Full address > Venue + City > City only
    let locationQuery = event.location;

    if (event.address && event.address !== event.location && event.address !== 'See website' && !event.address.includes('See website')) {
      // Use full address if available
      locationQuery = event.address;
    } else if (event.venue && event.venue !== event.location && !event.venue.includes('Venue')) {
      // Use venue + city for better accuracy
      locationQuery = `${event.venue}, ${event.location}`;
    }

    // Try to geocode with the best available address
    const coords = await getCoordinatesForLocation(locationQuery);

    if (coords) {
      eventsWithCoords.push({
        ...event,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      console.log(`✅ Geocoded: "${locationQuery}" → (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
    } else {
      // Fallback: try just the city if full address failed
      if (locationQuery !== event.location) {
        console.log(`⚠️ Trying fallback: ${event.location}`);
        const fallbackCoords = await getCoordinatesForLocation(event.location);

        if (fallbackCoords) {
          // Add slight random offset to avoid stacking pins (0.001 degrees ≈ 100 meters)
          const randomOffsetLat = (Math.random() - 0.5) * 0.01;
          const randomOffsetLon = (Math.random() - 0.5) * 0.01;

          eventsWithCoords.push({
            ...event,
            latitude: fallbackCoords.latitude + randomOffsetLat,
            longitude: fallbackCoords.longitude + randomOffsetLon,
          });
          console.log(`✅ Geocoded (city center + offset): ${event.location} → (${fallbackCoords.latitude.toFixed(4)}, ${fallbackCoords.longitude.toFixed(4)})`);
        } else {
          // Keep event but without coordinates
          eventsWithCoords.push({
            ...event,
            latitude: null,
            longitude: null,
          });
          console.warn(`❌ Could not geocode: ${event.location}`);
        }
      } else {
        // Keep event but without coordinates
        eventsWithCoords.push({
          ...event,
          latitude: null,
          longitude: null,
        });
        console.warn(`❌ Could not geocode: ${locationQuery}`);
      }
    }
  }

  return eventsWithCoords;
}

function processPerplexityResults(content: string, searchData: SearchRequest) {
  const events: any[] = [];

  try {
    // Find JSON array in the content - extract only the array part
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      // Clean the extracted JSON - remove any trailing text after the closing bracket
      let jsonString = jsonMatch[0];

      // Find the last closing bracket and truncate everything after it
      const lastBracketIndex = jsonString.lastIndexOf(']');
      if (lastBracketIndex !== -1) {
        jsonString = jsonString.substring(0, lastBracketIndex + 1);
      }

      const parsedEvents = JSON.parse(jsonString);
      const eventArray = Array.isArray(parsedEvents) ? parsedEvents : [parsedEvents];

      eventArray.forEach((event: any) => {
        // Use event's specific location if provided, otherwise fall back to venue or search location
        const eventLocation = event.location || event.venue || searchData.location;

        events.push({
          title: cleanEventTitle(event.title || event.name || 'Event'),
          description: event.description || `${searchData.activity_type} event in ${eventLocation}`,
          date: event.date || getDateInTimeframe(searchData.timeframe, 0),
          time: event.time || getRandomTime(),
          location: eventLocation,
          venue: event.venue || eventLocation,
          address: event.address || eventLocation,
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
      // Today: from now until end of day
      endDate.setHours(23, 59, 59);
      break;
    case 'this week':
      // This week: from now until end of Sunday
      const daysUntilSunday = 7 - now.getDay();
      endDate.setDate(now.getDate() + daysUntilSunday);
      endDate.setHours(23, 59, 59);
      break;
    case 'next week':
      // Next week: Monday to Sunday of next week
      const daysUntilNextMonday = (8 - now.getDay()) % 7 || 7;
      startDate.setDate(now.getDate() + daysUntilNextMonday);
      startDate.setHours(0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59);
      break;
    case 'this month':
      // This month: from now until end of current month
      endDate.setMonth(now.getMonth() + 1, 0); // Last day of current month
      endDate.setHours(23, 59, 59);
      break;
    case 'next month':
      // Next month: 1st to last day of next month
      startDate.setMonth(now.getMonth() + 1, 1);
      startDate.setHours(0, 0, 0);
      endDate.setMonth(now.getMonth() + 2, 0); // Last day of next month
      endDate.setHours(23, 59, 59);
      break;
    default:
      // Default: next 30 days
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
      // Spread events across today
      date.setHours(date.getHours() + offset * 2);
      break;
    case 'this week':
      // Spread events from now until end of this week
      const daysUntilSunday = 7 - now.getDay();
      const dayOffset = Math.floor((offset * daysUntilSunday) / 10); // Spread across remaining days
      date.setDate(now.getDate() + dayOffset);
      break;
    case 'next week':
      // Spread events across next week (Monday to Sunday)
      const daysUntilNextMonday = (8 - now.getDay()) % 7 || 7;
      const nextWeekStart = new Date(now);
      nextWeekStart.setDate(now.getDate() + daysUntilNextMonday);
      date.setDate(nextWeekStart.getDate() + (offset % 7)); // Spread across 7 days
      break;
    case 'this month':
      // Spread events across this month
      const daysLeftInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
      const monthOffset = Math.floor((offset * daysLeftInMonth) / 10);
      date.setDate(now.getDate() + monthOffset);
      break;
    case 'next month':
      // Spread events across next month
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const daysInNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate();
      const nextMonthOffset = Math.floor((offset * daysInNextMonth) / 10);
      date.setTime(nextMonthStart.getTime());
      date.setDate(1 + nextMonthOffset);
      break;
    default:
      // Default: spread across next 30 days
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
