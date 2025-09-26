import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';
import { UserSearch, COLLECTIONS, Event } from './lib/models';

interface SearchRequest {
  location: string;
  activity_type: string;
  timeframe: string;
  radius?: number;
  keywords?: string;
  email?: string;
  userId?: string; // Clerk user ID
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const searchData: SearchRequest = req.body;

    if (!searchData.location || !searchData.activity_type || !searchData.timeframe) {
      return res.status(400).json({
        success: false,
        error: 'Location, activity type, and timeframe are required'
      });
    }

    // Generate mock events (later replace with real AI generation)
    const generateMockEvents = (searchData: SearchRequest): Event[] => {
      const baseEvents = [
        {
          id: `evt-${Date.now()}-1`,
          title: `${searchData.activity_type} Event in ${searchData.location}`,
          description: `Amazing ${searchData.activity_type.toLowerCase()} experience happening ${searchData.timeframe.toLowerCase()}.`,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          location: searchData.location,
          price: '$15-35',
          category: searchData.activity_type,
          venue: `${searchData.location} Convention Center`,
          address: `123 Main St, ${searchData.location}`
        },
        {
          id: `evt-${Date.now()}-2`,
          title: `Local ${searchData.activity_type} Gathering`,
          description: `Join fellow enthusiasts for a memorable ${searchData.activity_type.toLowerCase()} event.`,
          date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          location: searchData.location,
          price: '$20-45',
          category: searchData.activity_type,
          venue: `${searchData.location} Community Hall`,
          address: `456 Oak Ave, ${searchData.location}`
        },
        {
          id: `evt-${Date.now()}-3`,
          title: `${searchData.timeframe} ${searchData.activity_type} Special`,
          description: `Don't miss this special ${searchData.activity_type.toLowerCase()} event.`,
          date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          location: searchData.location,
          price: '$25-50',
          category: searchData.activity_type,
          venue: `${searchData.location} Arts Center`,
          address: `789 Pine St, ${searchData.location}`
        }
      ];

      if (searchData.keywords) {
        baseEvents.forEach(event => {
          event.title += ` - ${searchData.keywords}`;
        });
      }

      return baseEvents;
    };

    const events = generateMockEvents(searchData);

    // Save search to database if user is authenticated
    if (searchData.userId) {
      try {
        const db = await getDatabase();
        const searchesCollection = db.collection<UserSearch>(COLLECTIONS.SEARCHES);

        const userSearch: UserSearch = {
          userId: searchData.userId,
          searchQuery: {
            location: searchData.location,
            activity_type: searchData.activity_type,
            timeframe: searchData.timeframe,
            radius: searchData.radius,
            keywords: searchData.keywords,
            email: searchData.email
          },
          results: events,
          location: searchData.location,
          activityType: searchData.activity_type,
          timeframe: searchData.timeframe,
          searchRadius: searchData.radius || 10,
          createdAt: new Date()
        };

        await searchesCollection.insertOne(userSearch);
      } catch (dbError) {
        console.error('Failed to save search to database:', dbError);
        // Continue without failing the request
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        events,
        totalResults: events.length,
        searchId: `search-${Date.now()}`
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
}