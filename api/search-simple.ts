import { VercelRequest, VercelResponse } from '@vercel/node';

interface SearchRequest {
  location: string;
  activity_type: string;
  timeframe: string;
  radius?: number;
  keywords?: string;
  email?: string;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const searchData: SearchRequest = req.body;

  if (!searchData.location || !searchData.activity_type || !searchData.timeframe) {
    return res.status(400).json({
      success: false,
      error: 'Location, activity type, and timeframe are required'
    });
  }

  // Generate mock search results based on the search criteria
  const generateMockEvents = (searchData: SearchRequest) => {
    const baseEvents = [
      {
        id: '1',
        title: `${searchData.activity_type} Event in ${searchData.location}`,
        description: `Amazing ${searchData.activity_type.toLowerCase()} experience happening ${searchData.timeframe.toLowerCase()}.`,
        date: '2025-09-28T19:00:00Z',
        location: searchData.location,
        price: '$15-35',
        category: searchData.activity_type,
        venue: `${searchData.location} Convention Center`,
        address: `123 Main St, ${searchData.location}`
      },
      {
        id: '2',
        title: `Local ${searchData.activity_type} Gathering`,
        description: `Join fellow enthusiasts for a memorable ${searchData.activity_type.toLowerCase()} event.`,
        date: '2025-09-29T20:00:00Z',
        location: searchData.location,
        price: '$20-45',
        category: searchData.activity_type,
        venue: `${searchData.location} Community Hall`,
        address: `456 Oak Ave, ${searchData.location}`
      },
      {
        id: '3',
        title: `${searchData.timeframe} ${searchData.activity_type} Special`,
        description: `Don't miss this special ${searchData.activity_type.toLowerCase()} event happening ${searchData.timeframe.toLowerCase()}.`,
        date: '2025-09-30T18:30:00Z',
        location: searchData.location,
        price: '$25-50',
        category: searchData.activity_type,
        venue: `${searchData.location} Arts Center`,
        address: `789 Pine St, ${searchData.location}`
      }
    ];

    // If keywords are provided, add them to titles
    if (searchData.keywords) {
      baseEvents.forEach(event => {
        event.title += ` - ${searchData.keywords}`;
      });
    }

    return baseEvents;
  };

  const events = generateMockEvents(searchData);
  const searchId = `search-${Date.now()}`;

  res.status(200).json({
    success: true,
    data: {
      events,
      totalResults: events.length,
      searchId
    }
  });
}