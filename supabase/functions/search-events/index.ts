// =====================================================
// Supabase Edge Function: search-events
// Handles event search with caching and LLM integration
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT token (if authenticated)
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    // Parse request body
    const searchData: SearchRequest = await req.json();

    console.log('🔍 Search Request:', {
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

    // Step 1: Check cache (existing events in database)
    const cachedEvents = await checkEventCache(supabaseClient, searchData);

    if (cachedEvents.length > 0) {
      console.log(`✅ Cache hit: Found ${cachedEvents.length} events`);

      // Get user's saved events if authenticated
      let userSavedEventIds: string[] = [];
      if (user) {
        userSavedEventIds = await getUserSavedEventIds(supabaseClient, user.id, cachedEvents.map(e => e.id));
      }

      // Save search history if authenticated
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

    // Step 2: Cache miss - Search with LLMs
    console.log('⚠️ Cache miss - Calling LLM APIs...');

    const newEvents = await searchWithLLMs(searchData);

    // Step 3: Save new events to database
    if (newEvents.length > 0) {
      await saveEventsToDatabase(supabaseClient, newEvents);
    }

    // Step 4: Get user's saved events if authenticated
    let userSavedEventIds: string[] = [];
    if (user && newEvents.length > 0) {
      userSavedEventIds = await getUserSavedEventIds(supabaseClient, user.id, newEvents.map(e => e.id));
    }

    // Step 5: Save search history if authenticated
    if (user) {
      await saveSearchHistory(supabaseClient, user.id, searchData, newEvents.length, false);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events: newEvents,
          userSavedEventIds,
          totalResults: newEvents.length,
          cached: false,
          source: 'LLM Search',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Search Error:', error);

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
// Helper Functions
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
  // Insert events (ignore duplicates due to unique constraint)
  const { error } = await supabaseClient.from('events').insert(events).select();

  if (error && !error.message.includes('duplicate key')) {
    console.error('Error saving events:', error);
  } else {
    console.log(`✅ Saved ${events.length} events to database`);
  }
}

async function searchWithLLMs(searchData: SearchRequest) {
  console.log('🤖 Starting intelligent search...');

  // Step 1: Search for real events in parallel (SerpAPI + Perplexity)
  const realEvents = await searchRealEventsInParallel(searchData);

  if (realEvents.length > 0) {
    console.log(`✅ Found ${realEvents.length} real events, enhancing with AI...`);

    // Step 2: Enhance real events with AI (better descriptions, validation)
    const enhancedEvents = await enhanceEventsWithAI(realEvents, searchData);
    return enhancedEvents;
  }

  console.log('⚠️ No real events found, generating with AI');

  // Fallback: Generate realistic events with AI
  return await generateEventsWithAI(searchData);
}

async function searchRealEventsInParallel(searchData: SearchRequest) {
  console.log('🔍 Searching for real events with Perplexity & SerpAPI in parallel...');

  const providers: { name: string; promise: Promise<any[]> }[] = [];

  // Add SerpAPI search
  if (Deno.env.get('SERP_API_KEY')) {
    providers.push({
      name: 'SerpAPI',
      promise: searchWithSerpAPI(searchData),
    });
  }

  // Add Perplexity search
  if (Deno.env.get('PERPLEXITY_API_KEY')) {
    providers.push({
      name: 'Perplexity',
      promise: searchWithPerplexity(searchData),
    });
  }

  if (providers.length === 0) {
    console.log('❌ No real event search APIs configured');
    return [];
  }

  console.log(`🚀 Running ${providers.length} search APIs in parallel...`);

  // Execute all searches in parallel
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
    console.log('❌ No events found from any provider');
    return [];
  }

  // Deduplicate and return up to 15 best events
  const uniqueEvents = deduplicateEvents(allEvents);
  console.log(`📊 Total unique events after deduplication: ${uniqueEvents.length}`);

  return uniqueEvents.slice(0, 15); // Increased from 10 to 15 for better results
}

async function searchWithSerpAPI(searchData: SearchRequest) {
  const SERP_API_KEY = Deno.env.get('SERP_API_KEY');
  const query = `"${searchData.activity_type}" events "${searchData.location}" ${searchData.timeframe} 2025 tickets`;

  console.log(`🔍 SerpAPI query: ${query}`);

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
    // Process more results (up to 10 instead of 6)
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

async function searchWithPerplexity(searchData: SearchRequest) {
  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
  const query = `Find 10 real upcoming ${searchData.activity_type} events in ${searchData.location} for ${searchData.timeframe} in 2025. Include event names, dates, venues, ticket prices, and website links. Return JSON array format.`;

  console.log(`🔍 Perplexity query: ${query}`);

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are a real event finder with web access. Search for real events and return them in JSON array format with fields: title, description, date (YYYY-MM-DD), time (HH:MM), venue, address, price, website.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      max_tokens: 3000, // Increased for more results
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
    } else {
      console.log('⚠️ Perplexity did not return JSON format, parsing text...');
      // Try to extract event info from plain text if no JSON
      const lines = content.split('\n');
      let currentEvent: any = {};

      lines.forEach((line) => {
        if (line.match(/^\d+\./)) {
          // New event starting
          if (currentEvent.title) {
            events.push(formatPerplexityEvent(currentEvent, searchData));
          }
          currentEvent = { title: line.replace(/^\d+\.\s*/, '').trim() };
        } else if (line.includes('Date:')) {
          currentEvent.date = line.replace(/Date:\s*/i, '').trim();
        } else if (line.includes('Venue:')) {
          currentEvent.venue = line.replace(/Venue:\s*/i, '').trim();
        } else if (line.includes('Price:')) {
          currentEvent.price = line.replace(/Price:\s*/i, '').trim();
        }
      });

      if (currentEvent.title) {
        events.push(formatPerplexityEvent(currentEvent, searchData));
      }
    }
  } catch (error) {
    console.error('Error parsing Perplexity results:', error);
  }

  console.log(`📊 Perplexity processed ${events.length} events`);
  return events.slice(0, 10); // Return up to 10 events
}

async function enhanceEventsWithAI(events: any[], searchData: SearchRequest) {
  console.log(`🔧 Enhancing ${events.length} real events with AI...`);

  // If we have OpenAI or Gemini, enhance the descriptions and details
  if (Deno.env.get('OPENAI_API_KEY')) {
    try {
      return await enhanceWithOpenAI(events, searchData);
    } catch (error) {
      console.error('OpenAI enhancement failed:', error);
      return events; // Return original events if enhancement fails
    }
  }

  if (Deno.env.get('GOOGLE_AI_API_KEY')) {
    try {
      return await enhanceWithGemini(events, searchData);
    } catch (error) {
      console.error('Gemini enhancement failed:', error);
      return events; // Return original events if enhancement fails
    }
  }

  // No AI available, return events as-is
  console.log('⚠️ No AI API available for enhancement, returning raw events');
  return events;
}

async function generateEventsWithAI(searchData: SearchRequest) {
  // Try OpenAI first
  if (Deno.env.get('OPENAI_API_KEY')) {
    try {
      return await generateWithOpenAI(searchData);
    } catch (error) {
      console.error('OpenAI failed:', error);
    }
  }

  // Try Gemini as fallback
  if (Deno.env.get('GOOGLE_AI_API_KEY')) {
    try {
      return await generateWithGemini(searchData);
    } catch (error) {
      console.error('Gemini failed:', error);
    }
  }

  // Last resort: return mock events
  return generateMockEvents(searchData);
}

async function generateWithOpenAI(searchData: SearchRequest) {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  const prompt = createEventPrompt(searchData);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert event curator. Return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/\[[\s\S]*\]/);

  if (!jsonMatch) throw new Error('No valid JSON in response');

  const events = JSON.parse(jsonMatch[0]);
  return events.map((e: any) => ({
    ...e,
    location: searchData.location,
    category: searchData.activity_type,
    source: 'OpenAI',
    real_event: false,
    image_url: getEventImage(searchData.activity_type),
  }));
}

async function generateWithGemini(searchData: SearchRequest) {
  const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
  const prompt = createEventPrompt(searchData);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2000 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  const jsonMatch = content.match(/\[[\s\S]*\]/);

  if (!jsonMatch) throw new Error('No valid JSON in response');

  const events = JSON.parse(jsonMatch[0]);
  return events.map((e: any) => ({
    ...e,
    location: searchData.location,
    category: searchData.activity_type,
    source: 'Gemini',
    real_event: false,
    image_url: getEventImage(searchData.activity_type),
  }));
}

async function enhanceWithOpenAI(events: any[], searchData: SearchRequest) {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

  const prompt = `You are an event data enhancer. Below are real events found from web search. Please improve their descriptions, ensure consistency, and fill in any missing details while keeping the core information accurate.

Search Context: ${searchData.activity_type} in ${searchData.location} for ${searchData.timeframe}

Events to enhance:
${JSON.stringify(events, null, 2)}

Return a JSON array with the same structure but improved descriptions, validated dates, and better formatting. Keep ticket_link, source, and real_event fields unchanged.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You enhance event data by improving descriptions and ensuring consistency. Return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI enhancement error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    console.log('⚠️ OpenAI enhancement returned invalid JSON, using original events');
    return events;
  }

  const enhancedEvents = JSON.parse(jsonMatch[0]);
  console.log(`✅ OpenAI enhanced ${enhancedEvents.length} events`);
  return enhancedEvents;
}

async function enhanceWithGemini(events: any[], searchData: SearchRequest) {
  const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

  const prompt = `You are an event data enhancer. Below are real events found from web search. Please improve their descriptions, ensure consistency, and fill in any missing details while keeping the core information accurate.

Search Context: ${searchData.activity_type} in ${searchData.location} for ${searchData.timeframe}

Events to enhance:
${JSON.stringify(events, null, 2)}

Return a JSON array with the same structure but improved descriptions, validated dates, and better formatting. Keep ticket_link, source, and real_event fields unchanged.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 3000 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini enhancement error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  const jsonMatch = content.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    console.log('⚠️ Gemini enhancement returned invalid JSON, using original events');
    return events;
  }

  const enhancedEvents = JSON.parse(jsonMatch[0]);
  console.log(`✅ Gemini enhanced ${enhancedEvents.length} events`);
  return enhancedEvents;
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

// =====================================================
// Utility Functions
// =====================================================

function createEventPrompt(searchData: SearchRequest): string {
  return `Generate 5 realistic events for: ${searchData.activity_type} in ${searchData.location} for ${searchData.timeframe}. Return JSON array with: title, description, date (YYYY-MM-DD), time (HH:MM), venue, address, price, organizer, capacity, special_feature, tags.`;
}

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
  // Remove common SEO junk from event titles
  return title
    .replace(/\s*-\s*Eventbrite.*$/i, '')
    .replace(/\s*\|\s*Tickets.*$/i, '')
    .replace(/\s*-\s*Ticketmaster.*$/i, '')
    .replace(/\s*-\s*Buy Tickets.*$/i, '')
    .trim();
}

function formatPerplexityEvent(event: any, searchData: SearchRequest) {
  return {
    title: cleanEventTitle(event.title || 'Event'),
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
  };
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
