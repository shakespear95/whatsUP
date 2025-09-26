import { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { generateEvents } from './services/eventGenerator';
import { query } from './lib/db';

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

    // Extract user ID from JWT token if provided
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
        userId = decoded.userId;
      } catch (error) {
        // Token invalid or expired, continue without user ID
      }
    }

    if (!searchData.location || !searchData.activity_type || !searchData.timeframe) {
      return res.status(400).json({
        success: false,
        error: 'Location, activity type, and timeframe are required'
      });
    }

    // Generate AI-powered events based on search criteria
    const events = await generateEvents(searchData, 8);

    const searchId = uuidv4();

    // Save search to database
    if (userId || searchData.email) {
      try {
        await query(
          `INSERT INTO user_searches
           (id, user_id, search_query, results, location, activity_type, timeframe, search_radius)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            searchId,
            userId,
            JSON.stringify(searchData),
            JSON.stringify(events),
            searchData.location,
            searchData.activity_type,
            searchData.timeframe,
            searchData.radius || 10
          ]
        );
      } catch (dbError) {
        console.error('Failed to save search to database:', dbError);
        // Continue without failing the request
      }
    }

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