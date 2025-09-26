import { VercelRequest, VercelResponse } from '@vercel/node';
import { generateFeaturedEvents } from './services/eventGenerator';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get location from query params or default to New York
    const location = (req.query.location as string) || 'New York, NY';

    // Generate AI-powered featured events
    const featuredEvents = await generateFeaturedEvents(location);

    res.status(200).json({
      success: true,
      data: {
        events: featuredEvents
      }
    });
  } catch (error) {
    console.error('Featured events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load featured events'
    });
  }
}