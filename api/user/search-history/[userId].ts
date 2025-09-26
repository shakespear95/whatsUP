import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

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

    // Mock search history data
    const mockSearchHistory = [
      {
        id: '1',
        searchId: 'search-123',
        searchCriteria: {
          location: 'New York, NY',
          activity_type: 'Music',
          timeframe: 'This Weekend',
          keywords: 'jazz'
        },
        timestamp: '2025-09-25T14:30:00Z',
        resultsCount: 5
      },
      {
        id: '2',
        searchId: 'search-456',
        searchCriteria: {
          location: 'Brooklyn, NY',
          activity_type: 'Food',
          timeframe: 'Today',
          keywords: 'food truck'
        },
        timestamp: '2025-09-24T11:15:00Z',
        resultsCount: 12
      },
      {
        id: '3',
        searchId: 'search-789',
        searchCriteria: {
          location: 'Manhattan, NY',
          activity_type: 'Art',
          timeframe: 'Next Week',
          keywords: 'gallery'
        },
        timestamp: '2025-09-23T16:45:00Z',
        resultsCount: 8
      }
    ];

    res.status(200).json({
      success: true,
      data: mockSearchHistory
    });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load search history'
    });
  }
}