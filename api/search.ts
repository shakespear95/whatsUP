import { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { generateEvents } from './services/eventGenerator';

interface SearchRequest {
  location: string;
  activity_type: string;
  timeframe: string;
  radius?: number;
  keywords?: string;
  email?: string;
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

    // Generate AI-powered events based on search criteria
    const events = await generateEvents(searchData, 8);

    const searchId = uuidv4();

    // TODO: Save search to database for history
    // TODO: If email provided, save for notifications

    res.status(200).json({
      success: true,
      data: {
        events,
        totalResults: events.length,
        searchId
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
}