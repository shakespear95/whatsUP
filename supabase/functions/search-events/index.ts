// =====================================================
// Supabase Edge Function: search-events
// AI Agent-based Event Search with Claude Orchestration
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

    // Get user from JWT token (optional for now - allows guest searches)
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      console.log('⚠️ Unauthenticated search - allowing as guest');
    } else {
      console.log('✅ Authenticated search:', user.email);
    }

    // Parse request body
    const searchData: SearchRequest = await req.json();

    console.log('🔍 Search Request:', {
      location: searchData.location,
      activity_type: searchData.activity_type,
      timeframe: searchData.timeframe,
      user_id: user?.id || 'guest',
      user_email: user?.email || 'guest',
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

    // =====================================================
    // AGENT-BASED SEARCH WITH CLAUDE (NEW IMPLEMENTATION)
    // =====================================================
    console.log('⚠️ Cache miss - Initiating AI Agent search with Claude...');

    // Execute agent-based search with Claude orchestration
    const agentEvents = await executeClaudeAgentSearch(searchData);

    // Step 3: Save new events to database
    if (agentEvents.length > 0) {
      await saveEventsToDatabase(supabaseClient, agentEvents);
    }

    // Step 4: Get user's saved events if authenticated
    let userSavedEventIds: string[] = [];
    if (user && agentEvents.length > 0) {
      userSavedEventIds = await getUserSavedEventIds(supabaseClient, user.id, agentEvents.map(e => e.id));
    }

    // Step 5: Save search history if authenticated
    if (user) {
      await saveSearchHistory(supabaseClient, user.id, searchData, agentEvents.length, false);
    }

    console.log(`✅ Returning ${agentEvents.length} events to client`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events: agentEvents,
          userSavedEventIds,
          totalResults: agentEvents.length,
          cached: false,
          source: 'AI Agent Search',
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
// CLAUDE AI AGENT ORCHESTRATION
// =====================================================

/**
 * Main agent execution function using Claude with tool-use capabilities
 * Claude acts as the orchestrator, deciding which tools to use and when
 */
async function executeClaudeAgentSearch(searchData: SearchRequest): Promise<any[]> {
  console.log('🤖 Initializing Claude AI Agent with tool-use capabilities...');

  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is required for agent functionality');
    throw new Error('Agent configuration error: Missing Anthropic API key');
  }

  // Define the tools available to Claude
  const tools = [
    {
      name: "perplexity_search",
      description: "Search for real-time event information using Perplexity's deep research capabilities. Best for finding current, accurate event data with citations.",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query for finding events"
          },
          model: {
            type: "string",
            enum: ["sonar", "sonar-deep-research", "sonar-pro"],
            description: "Perplexity model to use",
            default: "sonar-deep-research"
          }
        },
        required: ["query"]
      }
    },
    {
      name: "google_serp_search",
      description: "Search Google for event information using SerpAPI. Good for finding event websites, tickets, and general information.",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query for Google"
          },
          location: {
            type: "string",
            description: "Location for localized search results"
          }
        },
        required: ["query"]
      }
    },
    {
      name: "firecrawl_scrape",
      description: "Scrape detailed information from event websites using Firecrawl. Use when you have specific URLs to extract structured data from.",
      input_schema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to scrape"
          },
          formats: {
            type: "array",
            items: {
              type: "string",
              enum: ["markdown", "html", "rawHtml", "content", "links", "screenshot"]
            },
            description: "Formats to return the scraped data in",
            default: ["markdown"]
          }
        },
        required: ["url"]
      }
    },
    {
      name: "weather_check",
      description: "Get current weather conditions for event planning. Helps determine if indoor/outdoor events are suitable.",
      input_schema: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "Location to check weather for"
          }
        },
        required: ["location"]
      }
    }
  ];

  // System prompt that defines Claude's role and behavior
  const systemPrompt = `You are an expert Local Event Discovery Agent with access to powerful search and data extraction tools. Your mission is to find the best, most relevant events based on user criteria.

## Your Capabilities:
- You can use multiple tools in sequence to gather comprehensive information
- You think strategically about which tools to use and in what order
- You can validate and cross-reference information from multiple sources
- You focus on finding REAL, CURRENT events (not generating fictional ones)

## Your Process:
1. First, check weather conditions if relevant for outdoor events
2. Use Perplexity for deep research on current events in the area
3. Use Google SERP for additional event discoveries and ticket links
4. Use Firecrawl to extract detailed information from promising event pages
5. Synthesize all findings into a comprehensive list

## Important Guidelines:
- Aim for 20 unique, high-quality events per search
- Include diverse event types matching the user's interests
- Provide practical details (dates, times, prices, venues)
- Consider weather conditions for outdoor events
- Focus on events within the specified timeframe
- Prioritize accuracy and real events
- Return structured data that can be parsed and stored

## When to Stop Using Tools:
IMPORTANT: After 4-6 tool calls, STOP using tools and immediately provide the JSON output. Do NOT make more searches. Do NOT say "Let me search for more". Just return the JSON array with the events you've found.

## Output Format:
When you're done with tool calls, return ONLY a valid JSON array - NO explanations, NO markdown, NO text before or after, NO "Based on my searches" - ONLY the JSON array starting with [ and ending with ].

YOU MUST RETURN JSON. DO NOT WRITE TEXT. DO NOT SAY "let me compile" OR "based on my searches". ONLY OUTPUT THE JSON ARRAY.

Example - THIS IS EXACTLY WHAT YOUR OUTPUT SHOULD LOOK LIKE:
[
  {
    "title": "Event Name",
    "description": "Brief compelling description (2-3 sentences)",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "location": "City/area",
    "venue": "Specific venue name",
    "address": "Full address if available",
    "price": "Price or price range",
    "category": "Event category matching user request",
    "special_feature": "Unique aspects or highlights",
    "ticket_link": "URL for tickets/registration or null",
    "source": "Where information was found"
  }
]

CRITICAL RULES:
- NO text before the [
- NO text after the ]
- NO "Based on my searches"
- NO "Let me compile"
- NO "Here are the events"
- ONLY the JSON array
- START your response with [ and END with ]`;

  // User prompt with search parameters
  const userPrompt = `Find the best ${searchData.activity_type} events in ${searchData.location} for ${searchData.timeframe}.
${searchData.keywords ? `Additional keywords: ${searchData.keywords}` : ''}
${searchData.radius ? `Within ${searchData.radius}km radius` : ''}
${searchData.budget ? `Budget: ${searchData.budget}` : ''}

Use your available tools strategically to find real, current events. Start with weather check if relevant, then use deep search tools to find comprehensive event information.

TARGET: Return 15-20 high-quality, diverse event recommendations. Use 4-6 tool calls maximum.

CRITICAL: After your tool calls, respond ONLY with a JSON array. Do NOT write "Based on my searches" or any other text. Your entire response must be valid JSON starting with [ and ending with ].`;

  try {
    // Call Claude API with tool-use capability
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'tools-2024-04-04'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 8192,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        tools: tools,
        tool_choice: { type: "auto" }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Claude API error:', error);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeResponse = await response.json();
    console.log('✅ Claude initial response received');

    // Process Claude's response and handle tool calls
    const events = await processClaudeAgentResponse(claudeResponse, searchData, systemPrompt, tools);

    return events;

  } catch (error) {
    console.error('❌ Agent execution failed:', error);
    throw error;
  }
}

/**
 * Process Claude's response and execute tool calls iteratively
 * This implements the agent loop where Claude can make multiple tool calls
 */
async function processClaudeAgentResponse(
  claudeResponse: any,
  searchData: SearchRequest,
  systemPrompt: string,
  tools: any[]
): Promise<any[]> {
  console.log('🔄 Processing Claude agent response...');

  const messages = [
    {
      role: 'user',
      content: `Find the best ${searchData.activity_type} events in ${searchData.location} for ${searchData.timeframe}.`
    }
  ];

  let assistantMessage = claudeResponse;
  let toolCallCount = 0;
  const maxToolCalls = 10; // Balanced for performance and event count
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  // Agent loop - continue while Claude wants to use tools
  while (toolCallCount < maxToolCalls) {
    messages.push({
      role: 'assistant',
      content: assistantMessage.content
    });

    // Check if Claude wants to use tools
    if (assistantMessage.stop_reason === 'tool_use') {
      console.log(`🛠️ Claude requesting tool use (iteration ${toolCallCount + 1})`);

      const toolUses = assistantMessage.content.filter((block: any) => block.type === 'tool_use');
      const toolResults = [];

      // Execute each tool call with timeout
      for (const toolUse of toolUses) {
        console.log(`📞 Calling tool: ${toolUse.name}`);

        try {
          // Add 30 second timeout for tool execution
          const toolResult = await Promise.race([
            executeToolCall(toolUse.name, toolUse.input, searchData),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Tool execution timeout')), 30000)
            )
          ]);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(toolResult)
          });
        } catch (error) {
          console.error(`❌ Tool ${toolUse.name} failed:`, error);
          // Return error to Claude so it can adapt
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({ error: error.message }),
            is_error: true
          });
        }
      }

      // Add tool results to messages
      messages.push({
        role: 'user',
        content: toolResults
      });

      // Get Claude's next response (might use more tools or give final answer)
      const nextResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'tools-2024-04-04'
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 8192,
          temperature: 0.7,
          system: systemPrompt,
          messages: messages,
          tools: tools  // Keep tools available in case Claude needs more data
        })
      });

      if (!nextResponse.ok) {
        console.error('❌ Claude continuation failed');
        break;
      }

      assistantMessage = await nextResponse.json();
      toolCallCount++;

    } else {
      // Claude is done with tool use, extract final response
      console.log('✅ Claude completed tool usage, extracting events...');
      break;
    }
  }

  // If we hit max tool calls and Claude still wants to use tools, force it to stop
  if (toolCallCount >= maxToolCalls && assistantMessage.stop_reason === 'tool_use') {
    console.warn(`⚠️ Hit max tool calls (${maxToolCalls}), forcing final response...`);

    // Send one final message asking for JSON output only
    messages.push({
      role: 'assistant',
      content: assistantMessage.content
    });

    messages.push({
      role: 'user',
      content: [{
        type: 'text',
        text: 'You have reached the maximum number of tool calls. Please provide your final answer now as a JSON array of events. Do NOT request more tools. Output ONLY the JSON array.'
      }]
    });

    const finalResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 8192,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages
        // NO tools - force text-only response
      })
    });

    if (finalResponse.ok) {
      assistantMessage = await finalResponse.json();
      console.log('✅ Got forced final response from Claude');
    }
  }

  // Extract events from Claude's final response
  const events = extractEventsFromClaudeResponse(assistantMessage, searchData);
  console.log(`🎉 Agent search complete! Found ${events.length} events after ${toolCallCount} tool calls`);
  return events;
}

/**
 * Execute individual tool calls based on Claude's requests
 * This is where we implement the actual tool functionality
 */
async function executeToolCall(
  toolName: string,
  toolInput: any,
  searchData: SearchRequest
): Promise<any> {
  console.log(`🔧 Executing tool: ${toolName} with input:`, toolInput);

  switch (toolName) {
    case 'perplexity_search':
      return await executePerplexitySearch(toolInput, searchData);

    case 'google_serp_search':
      return await executeGoogleSerpSearch(toolInput, searchData);

    case 'firecrawl_scrape':
      return await executeFirecrawlScrape(toolInput);

    case 'weather_check':
      return await executeWeatherCheck(toolInput);

    default:
      console.warn(`⚠️ Unknown tool requested: ${toolName}`);
      return { error: `Unknown tool: ${toolName}` };
  }
}

/**
 * Tool Implementation: Perplexity Search
 * Uses Perplexity API for deep research on events
 */
async function executePerplexitySearch(input: any, searchData: SearchRequest): Promise<any> {
  console.log('🔍 Executing Perplexity search...');

  const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

  if (!PERPLEXITY_API_KEY) {
    return { error: 'Perplexity API key not configured' };
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: input.model || 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a real event finder. Search for actual, current events and return structured data. Aim to find as many relevant events as possible (10-15 per search).'
          },
          {
            role: 'user',
            content: input.query
          }
        ],
        max_tokens: 5000,
        temperature: 0.2,
        return_citations: true,
        search_recency_filter: 'week'
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.choices[0].message.content,
      citations: data.citations || []
    };

  } catch (error) {
    console.error('❌ Perplexity search failed:', error);
    return { error: error.message };
  }
}

/**
 * Tool Implementation: Google SERP Search
 * Uses SerpAPI for Google search results
 */
async function executeGoogleSerpSearch(input: any, searchData: SearchRequest): Promise<any> {
  console.log('🔍 Executing Google SERP search...');

  const SERP_API_KEY = Deno.env.get('SERP_API_KEY');

  if (!SERP_API_KEY) {
    return { error: 'SERP API key not configured' };
  }

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(input.query)}&location=${encodeURIComponent(input.location || searchData.location)}&api_key=${SERP_API_KEY}&num=20`
    );

    if (!response.ok) {
      throw new Error(`SERP API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract relevant results
    const results = (data.organic_results || []).map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      date: result.date
    }));

    return {
      success: true,
      results: results,
      total_results: data.search_information?.total_results
    };

  } catch (error) {
    console.error('❌ Google SERP search failed:', error);
    return { error: error.message };
  }
}

/**
 * Tool Implementation: Firecrawl Web Scraping
 * Uses Firecrawl API to extract structured data from event pages
 */
async function executeFirecrawlScrape(input: any): Promise<any> {
  console.log('🔍 Executing Firecrawl scrape...');

  const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

  if (!FIRECRAWL_API_KEY) {
    return { error: 'Firecrawl API key not configured' };
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url: input.url,
        formats: input.formats || ['markdown'],
        onlyMainContent: true,
        includeTags: ['h1', 'h2', 'h3', 'p', 'time', 'address'],
        waitFor: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.data,
      metadata: data.metadata || {}
    };

  } catch (error) {
    console.error('❌ Firecrawl scrape failed:', error);
    return { error: error.message };
  }
}

/**
 * Tool Implementation: Weather Check
 * Gets current weather conditions for event planning
 */
async function executeWeatherCheck(input: any): Promise<any> {
  console.log('🌤️ Checking weather conditions...');

  const WEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

  if (!WEATHER_API_KEY) {
    return {
      condition: 'unknown',
      temperature: 20,
      description: 'Weather data unavailable',
      indoor_recommended: false
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(input.location)}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const badWeather = ['rain', 'thunderstorm', 'snow', 'drizzle'];
    const condition = data.weather[0].main.toLowerCase();

    return {
      success: true,
      condition: condition,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      indoor_recommended: badWeather.includes(condition),
      humidity: data.main.humidity,
      wind_speed: data.wind.speed
    };

  } catch (error) {
    console.error('❌ Weather check failed:', error);
    return { error: error.message };
  }
}

/**
 * Extract structured event data from Claude's final response
 * Parses Claude's output and formats it for storage
 */
function extractEventsFromClaudeResponse(claudeResponse: any, searchData: SearchRequest): any[] {
  console.log('📝 Extracting events from Claude response...');

  try {
    // Get the text content from Claude's response
    let content = '';
    if (Array.isArray(claudeResponse.content)) {
      content = claudeResponse.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');
    } else if (typeof claudeResponse.content === 'string') {
      content = claudeResponse.content;
    }

    // Remove markdown code blocks if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Remove common conversational phrases that Claude adds
    content = content.replace(/^.*?Based on my searches.*?(?=\[)/s, '');
    content = content.replace(/^.*?Let me compile.*?(?=\[)/s, '');
    content = content.replace(/^.*?Here are.*?(?=\[)/s, '');

    // Try to extract JSON array from the content (greedy match to get full array)
    const jsonMatch = content.match(/\[([\s\S]*)\]/);
    if (!jsonMatch) {
      console.warn('⚠️ No JSON array found in Claude response');
      console.log('📄 Response content:', content.substring(0, 500));
      return [];
    }

    // Reconstruct the JSON array
    let jsonString = '[' + jsonMatch[1] + ']';

    // Clean up potential JSON issues
    jsonString = jsonString.replace(/,(\s*[\]}])/g, '$1'); // Remove trailing commas

    const events = JSON.parse(jsonString);

    // Ensure all events have required fields and proper formatting
    return events.map((event: any, index: number) => ({
      id: generateEventId(event, index),
      title: event.title || `${searchData.activity_type} Event`,
      description: event.description || '',
      date: formatDate(event.date) || getDateInTimeframe(searchData.timeframe, index),
      time: event.time || '19:00',
      location: event.location || searchData.location,
      venue: event.venue || 'TBA',
      address: event.address || searchData.location,
      price: event.price || 'Check website',
      category: searchData.activity_type,
      special_feature: event.special_feature || '',
      organizer: event.organizer || 'Event Organizer',
      capacity: event.capacity || 'Unlimited',
      tags: event.tags || [searchData.activity_type.toLowerCase()],
      ticket_link: event.ticket_link || event.url || null,
      source: event.source || 'AI Agent Search',
      real_event: true,
      image_url: event.image_url || getEventImage(searchData.activity_type)
    }));

  } catch (error) {
    console.error('❌ Failed to extract events:', error);
    return [];
  }
}

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
    .limit(30);

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
      date.setDate(now.getDate() + 1 + offset);
      break;
    case 'next week':
      date.setDate(now.getDate() + 7 + offset);
      break;
    case 'this month':
      date.setDate(now.getDate() + 1 + offset * 3);
      break;
    case 'next month':
      date.setMonth(now.getMonth() + 1);
      date.setDate(Math.min(offset * 4 + 1, 28));
      break;
    default:
      date.setDate(now.getDate() + 1 + offset * 2);
  }

  if (date < now) {
    date.setDate(now.getDate() + 1 + offset);
  }

  return date.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn('Invalid date format:', dateStr);
  }
  return '';
}

function generateEventId(event: any, index: number): string {
  // Generate a proper UUID v4
  return crypto.randomUUID();
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
