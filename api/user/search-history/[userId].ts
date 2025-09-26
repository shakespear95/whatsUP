import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { query } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId } = req.query;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key'
    ) as { userId: string };

    // Check if the user is accessing their own data
    if (decoded.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get search history from database
    const searchHistoryResult = await query(
      `SELECT id, search_query, location, activity_type, timeframe, created_at,
              jsonb_array_length(results) as results_count
       FROM user_searches
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const searchHistory = searchHistoryResult.rows.map(row => ({
      id: row.id,
      searchId: row.id,
      searchCriteria: row.search_query,
      timestamp: row.created_at,
      resultsCount: row.results_count || 0,
      location: row.location,
      activityType: row.activity_type,
      timeframe: row.timeframe
    }));

    res.status(200).json({
      success: true,
      data: searchHistory
    });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load search history'
    });
  }
}