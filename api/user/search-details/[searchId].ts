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
    const { searchId } = req.query;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

    // Get search details from database
    const searchResult = await query(
      'SELECT results FROM user_searches WHERE id = $1',
      [searchId]
    );

    if (searchResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Search not found'
      });
    }

    const events = searchResult.rows[0].results || [];

    res.status(200).json({
      success: true,
      data: {
        events
      }
    });
  } catch (error) {
    console.error('Search details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load search details'
    });
  }
}