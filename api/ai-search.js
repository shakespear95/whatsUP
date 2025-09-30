export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const searchData = req.body;

  if (!searchData.location || !searchData.activity_type || !searchData.timeframe) {
    return res.status(400).json({
      success: false,
      error: 'Location, activity type, and timeframe are required'
    });
  }

  try {
    // Generate AI-powered events
    const events = await generateEventsWithAI(searchData);

    res.status(200).json({
      success: true,
      data: {
        events,
        totalResults: events.length,
        searchId: `ai-search-${Date.now()}`,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI Search Error:', error);

    // Fallback to enhanced mock data if AI fails
    const fallbackEvents = generateEnhancedMockEvents(searchData);

    res.status(200).json({
      success: true,
      data: {
        events: fallbackEvents,
        totalResults: fallbackEvents.length,
        searchId: `fallback-search-${Date.now()}`,
        fallback: true
      }
    });
  }
}

async function generateEventsWithAI(searchData) {
  const { location, activity_type, timeframe, budget, keywords, radius } = searchData;

  // Create dynamic prompt based on search filters
  const prompt = createEventPrompt(searchData);

  // Try multiple AI providers for reliability
  const aiProviders = [
    { name: 'openai', func: generateWithOpenAI },
    { name: 'claude', func: generateWithClaude },
    { name: 'gemini', func: generateWithGemini }
  ];

  for (const provider of aiProviders) {
    try {
      if (isProviderAvailable(provider.name)) {
        const events = await provider.func(prompt, searchData);
        if (events && events.length > 0) {
          return enhanceGeneratedEvents(events, searchData);
        }
      }
    } catch (error) {
      console.log(`${provider.name} failed, trying next provider:`, error.message);
      continue;
    }
  }

  throw new Error('All AI providers failed');
}

function createEventPrompt(searchData) {
  const { location, activity_type, timeframe, budget, keywords } = searchData;

  return `Generate 5-8 realistic, diverse events for the following search:

Location: ${location}
Activity Type: ${activity_type}
Timeframe: ${timeframe}
Budget: ${budget || 'Any'}
Keywords: ${keywords || 'None'}

Requirements:
- Events should be realistic and location-appropriate
- Include various price points and venues
- Mix popular and unique/niche events
- Consider local culture and attractions
- Provide specific addresses and venues
- Include realistic dates within the timeframe
- Make events engaging and diverse

Return JSON array with this exact structure:
[
  {
    "id": "unique-id",
    "title": "Event Title",
    "description": "Detailed description (50-100 words)",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "location": "${location}",
    "venue": "Specific Venue Name",
    "address": "Complete Address",
    "price": "Price Range or Free",
    "category": "Category",
    "specialFeature": "What makes this special",
    "organizer": "Event Organizer",
    "capacity": "Expected attendance",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

Make each event unique and compelling. Focus on quality over quantity.`;
}

async function generateWithOpenAI(prompt, searchData) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert event curator who generates realistic, engaging local events. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Extract JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No valid JSON found in response');

  return JSON.parse(jsonMatch[0]);
}

async function generateWithClaude(prompt, searchData) {
  // Placeholder for Claude API integration
  throw new Error('Claude API not configured');
}

async function generateWithGemini(prompt, searchData) {
  const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
  if (!GOOGLE_AI_API_KEY) throw new Error('Gemini API key not configured');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2000,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;

  // Extract JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No valid JSON found in response');

  return JSON.parse(jsonMatch[0]);
}

function isProviderAvailable(provider) {
  switch (provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'gemini':
      return !!process.env.GOOGLE_AI_API_KEY;
    case 'claude':
      return !!process.env.ANTHROPIC_API_KEY;
    default:
      return false;
  }
}

function enhanceGeneratedEvents(events, searchData) {
  return events.map((event, index) => ({
    ...event,
    id: `ai-${Date.now()}-${index}`,
    latitude: getRandomLatitude(searchData.location),
    longitude: getRandomLongitude(searchData.location),
    image: getEventImage(event.category),
    source: 'AI Generated',
    tickets: generateTicketInfo(event),
    createdAt: new Date().toISOString(),
    aiGenerated: true
  }));
}

function generateEnhancedMockEvents(searchData) {
  const { location, activity_type, timeframe, budget, keywords } = searchData;

  const eventTemplates = [
    {
      title: `${activity_type} Showcase in ${location}`,
      description: `Premium ${activity_type.toLowerCase()} experience featuring local talent and international guests. Perfect for enthusiasts and newcomers alike.`,
      category: activity_type,
      venue: `${location} Cultural Center`,
      specialFeature: 'Live performances and interactive exhibits'
    },
    {
      title: `Underground ${activity_type} Scene`,
      description: `Discover the hidden ${activity_type.toLowerCase()} community in ${location}. Intimate setting with cutting-edge artists and innovative formats.`,
      category: activity_type,
      venue: `The Warehouse ${location}`,
      specialFeature: 'Exclusive underground venue'
    },
    {
      title: `${activity_type} Festival Weekend`,
      description: `Two-day celebration of ${activity_type.toLowerCase()} featuring workshops, performances, and community activities. Family-friendly with food vendors.`,
      category: activity_type,
      venue: `${location} Park Pavilion`,
      specialFeature: 'Weekend festival with multiple stages'
    },
    {
      title: `Artisan ${activity_type} Workshop`,
      description: `Hands-on workshop where you can learn ${activity_type.toLowerCase()} techniques from master practitioners. All skill levels welcome.`,
      category: activity_type,
      venue: `${location} Maker Space`,
      specialFeature: 'Interactive workshop with take-home creations'
    },
    {
      title: `${location} ${activity_type} Championships`,
      description: `Annual competition featuring the best ${activity_type.toLowerCase()} talent from across the region. Exciting prizes and audience participation.`,
      category: activity_type,
      venue: `${location} Arena`,
      specialFeature: 'Competition with prizes and audience voting'
    }
  ];

  return eventTemplates.map((template, index) => ({
    id: `enhanced-${Date.now()}-${index}`,
    title: keywords ? `${template.title} - ${keywords}` : template.title,
    description: template.description,
    date: getDateInTimeframe(timeframe, index),
    time: getRandomTime(),
    location: location,
    venue: template.venue,
    address: `${Math.floor(Math.random() * 999) + 1} Main St, ${location}`,
    price: generatePrice(budget),
    category: template.category,
    specialFeature: template.specialFeature,
    latitude: getRandomLatitude(location),
    longitude: getRandomLongitude(location),
    image: getEventImage(template.category),
    source: 'Enhanced Mock',
    organizer: `${location} Events Co.`,
    capacity: `${Math.floor(Math.random() * 500) + 50} people`,
    tags: generateTags(activity_type, keywords),
    tickets: { type: 'link', value: 'https://tickets.example.com', label: 'Get Tickets' }
  }));
}

function getDateInTimeframe(timeframe, offset = 0) {
  const now = new Date();
  let targetDate = new Date(now);

  switch (timeframe.toLowerCase()) {
    case 'today':
      targetDate.setHours(targetDate.getHours() + offset * 2);
      break;
    case 'this week':
      targetDate.setDate(now.getDate() + offset);
      break;
    case 'next week':
      targetDate.setDate(now.getDate() + 7 + offset);
      break;
    case 'this month':
      targetDate.setDate(now.getDate() + offset * 3);
      break;
    case 'next month':
      targetDate.setMonth(now.getMonth() + 1);
      targetDate.setDate(offset * 4 + 1);
      break;
    default:
      targetDate.setDate(now.getDate() + offset * 2);
  }

  return targetDate.toISOString().split('T')[0];
}

function getRandomTime() {
  const hours = Math.floor(Math.random() * 12) + 10; // 10 AM to 10 PM
  const minutes = Math.random() < 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function generatePrice(budget) {
  if (!budget || budget === 'Any') {
    const prices = ['Free', '$5-15', '$10-25', '$15-35', '$20-45', '$25-50'];
    return prices[Math.floor(Math.random() * prices.length)];
  }
  return budget;
}

function generateTags(activity_type, keywords) {
  const baseTags = [activity_type.toLowerCase()];
  if (keywords) baseTags.push(...keywords.toLowerCase().split(' '));

  const additionalTags = ['local', 'community', 'featured', 'popular', 'unique'];
  baseTags.push(additionalTags[Math.floor(Math.random() * additionalTags.length)]);

  return baseTags.slice(0, 3);
}

function getRandomLatitude(location) {
  // Get approximate coordinates for the searched location
  const locationCoords = getLocationCoordinates(location);
  return locationCoords.lat + (Math.random() * 0.1 - 0.05); // Small variation around location
}

function getRandomLongitude(location) {
  const locationCoords = getLocationCoordinates(location);
  return locationCoords.lng + (Math.random() * 0.1 - 0.05); // Small variation around location
}

function getLocationCoordinates(location) {
  // Global location coordinates
  const locationMap = {
    // Switzerland
    'vaduz': { lat: 47.1410, lng: 9.5209 },
    'zurich': { lat: 47.3769, lng: 8.5417 },
    'geneva': { lat: 46.2044, lng: 6.1432 },
    'basel': { lat: 47.5596, lng: 7.5886 },
    'bern': { lat: 46.9481, lng: 7.4474 },
    'lausanne': { lat: 46.5197, lng: 6.6323 },
    'lucerne': { lat: 47.0502, lng: 8.3093 },
    'st. gallen': { lat: 47.4245, lng: 9.3767 },

    // South Africa
    'cape town': { lat: -33.9249, lng: 18.4241 },
    'johannesburg': { lat: -26.2041, lng: 28.0473 },
    'durban': { lat: -29.8587, lng: 31.0218 },
    'pretoria': { lat: -25.7479, lng: 28.2293 },

    // Major Global Cities
    'new york': { lat: 40.7128, lng: -74.0060 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'miami': { lat: 25.7617, lng: -80.1918 },
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'paris': { lat: 48.8566, lng: 2.3522 },
    'berlin': { lat: 52.5200, lng: 13.4050 },
    'rome': { lat: 41.9028, lng: 12.4964 },
    'madrid': { lat: 40.4168, lng: -3.7038 },
    'barcelona': { lat: 41.3851, lng: 2.1734 },
    'amsterdam': { lat: 52.3676, lng: 4.9041 },
    'vienna': { lat: 48.2082, lng: 16.3738 },
    'prague': { lat: 50.0755, lng: 14.4378 },
    'munich': { lat: 48.1351, lng: 11.5820 },
    'copenhagen': { lat: 55.6761, lng: 12.5683 },
    'stockholm': { lat: 59.3293, lng: 18.0686 },

    // Asia Pacific
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'sydney': { lat: -33.8688, lng: 151.2093 },
    'melbourne': { lat: -37.8136, lng: 144.9631 },
    'singapore': { lat: 1.3521, lng: 103.8198 },
    'hong kong': { lat: 22.3193, lng: 114.1694 },
    'seoul': { lat: 37.5665, lng: 126.9780 },
    'bangkok': { lat: 13.7563, lng: 100.5018 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },

    // Canada
    'toronto': { lat: 43.6532, lng: -79.3832 },
    'vancouver': { lat: 49.2827, lng: -123.1207 },
    'montreal': { lat: 45.5017, lng: -73.5673 },

    // Other Major Cities
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'cairo': { lat: 30.0444, lng: 31.2357 },
    'istanbul': { lat: 41.0082, lng: 28.9784 },
    'moscow': { lat: 55.7558, lng: 37.6176 },
    'budapest': { lat: 47.4979, lng: 19.0402 },
    'warsaw': { lat: 52.2297, lng: 21.0122 },
    'athens': { lat: 37.9838, lng: 23.7275 },
    'lisbon': { lat: 38.7223, lng: -9.1393 },
    'oslo': { lat: 59.9139, lng: 10.7522 },
    'helsinki': { lat: 60.1699, lng: 24.9384 }
  };

  const searchKey = location.toLowerCase().replace(/,.*/, '').trim();
  return locationMap[searchKey] || { lat: 47.1410, lng: 9.5209 }; // Default to Vaduz
}

function getEventImage(category) {
  const imageMap = {
    'Concerts & Party': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    'Stage & Theater': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    'Art & Museums': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    'Sports & Recreation': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'Food & Culinary': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'Knowledge & Business': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    'default': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
  };

  return imageMap[category] || imageMap.default;
}

function generateTicketInfo(event) {
  if (event.price === 'Free') {
    return { type: 'free' };
  }

  const types = ['link', 'website', 'phone'];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case 'link':
      return { type: 'link', value: 'https://tickets.example.com', label: 'Buy Tickets' };
    case 'website':
      return { type: 'website', value: 'https://venue.example.com', label: 'Visit Website' };
    case 'phone':
      return { type: 'phone', value: '(555) 123-4567', label: 'Call for Tickets' };
    default:
      return { type: 'link', value: 'https://tickets.example.com', label: 'Get Tickets' };
  }
}