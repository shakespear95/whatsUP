import OpenAI from 'openai';

interface EventRequest {
  location: string;
  activity_type: string;
  timeframe: string;
  keywords?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEvents(searchData: EventRequest, count: number = 5) {
  try {
    const prompt = `Generate ${count} realistic local events for the following criteria:

Location: ${searchData.location}
Activity Type: ${searchData.activity_type === 'Any' ? 'Various types' : searchData.activity_type}
Timeframe: ${searchData.timeframe}
${searchData.keywords ? `Keywords: ${searchData.keywords}` : ''}

For each event, provide:
- title (creative and engaging)
- description (2-3 sentences)
- date (realistic date within the timeframe, format: YYYY-MM-DDTHH:MM:SSZ)
- venue (realistic venue name for the location)
- address (realistic address in the specified location)
- price (realistic pricing, can be "Free")
- category (one of: Music, Food, Workshop, Outdoor, Art, Sports)

Return ONLY a valid JSON array of events, no other text. Each event should match this structure:
{
  "title": "Event Name",
  "description": "Event description...",
  "date": "2025-10-15T19:00:00Z",
  "location": "${searchData.location}",
  "venue": "Venue Name",
  "address": "123 Street Name, City, State",
  "price": "$25-50",
  "category": "Music"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert event curator who generates realistic, engaging local events. Always return valid JSON arrays only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.8,
    });

    const eventsText = completion.choices[0]?.message?.content;
    if (!eventsText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const events = JSON.parse(eventsText);

    // Add unique IDs and ensure all required fields
    return events.map((event: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      title: event.title,
      description: event.description,
      date: event.date,
      location: searchData.location,
      price: event.price,
      category: event.category,
      venue: event.venue,
      address: event.address,
      latitude: getRandomLatitude(),
      longitude: getRandomLongitude(),
      ticketLink: generateTicketLink(event.title)
    }));

  } catch (error) {
    console.error('Error generating events with AI:', error);

    // Fallback to basic mock events if AI fails
    return getFallbackEvents(searchData, count);
  }
}

export async function generateFeaturedEvents(location: string = 'New York, NY') {
  try {
    const prompt = `Generate 6 diverse featured events happening in ${location} over the next 2 weeks.

Include a mix of:
- Music events (concerts, live performances)
- Food events (festivals, tastings, markets)
- Art events (gallery openings, workshops)
- Outdoor activities (sports, nature, recreation)
- Educational workshops or cultural events

Make them sound exciting and realistic for ${location}. Return ONLY a valid JSON array.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert local event curator. Generate diverse, exciting events that locals would actually want to attend. Always return valid JSON arrays only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.9,
    });

    const eventsText = completion.choices[0]?.message?.content;
    if (!eventsText) {
      throw new Error('No response from OpenAI');
    }

    const events = JSON.parse(eventsText);

    return events.map((event: any, index: number) => ({
      id: `featured-${Date.now()}-${index}`,
      title: event.title,
      description: event.description,
      date: event.date,
      location: location,
      price: event.price,
      category: event.category,
      venue: event.venue,
      address: event.address,
      latitude: getRandomLatitude(),
      longitude: getRandomLongitude(),
      ticketLink: event.price === 'Free' ? null : generateTicketLink(event.title)
    }));

  } catch (error) {
    console.error('Error generating featured events:', error);
    return getFallbackEvents({ location, activity_type: 'Any', timeframe: 'Next Week' }, 6);
  }
}

function getFallbackEvents(searchData: EventRequest, count: number) {
  const categories = ['Music', 'Food', 'Workshop', 'Outdoor', 'Art', 'Sports'];
  const fallbackEvents = [];

  for (let i = 0; i < count; i++) {
    fallbackEvents.push({
      id: `fallback-${Date.now()}-${i}`,
      title: `Local ${categories[i % categories.length]} Event`,
      description: `A wonderful ${categories[i % categories.length].toLowerCase()} event in ${searchData.location}.`,
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      location: searchData.location,
      price: i % 2 === 0 ? 'Free' : `$${10 + i * 5}-${20 + i * 10}`,
      category: categories[i % categories.length],
      venue: `${searchData.location} Community Center`,
      address: `${100 + i} Main St, ${searchData.location}`,
      latitude: getRandomLatitude(),
      longitude: getRandomLongitude(),
      ticketLink: i % 2 === 0 ? null : `https://tickets.example.com/event-${i}`
    });
  }

  return fallbackEvents;
}

function getRandomLatitude() {
  return 40.7128 + (Math.random() - 0.5) * 0.1; // Around NYC area
}

function getRandomLongitude() {
  return -74.0060 + (Math.random() - 0.5) * 0.1; // Around NYC area
}

function generateTicketLink(title: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `https://tickets.example.com/${slug}`;
}