import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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

    // Mock search details data based on searchId
    const getSearchResults = (searchId: string) => {
      switch (searchId) {
        case 'search-123':
          return [
            {
              id: uuidv4(),
              title: 'Blue Note Jazz Sessions',
              description: 'Weekly jazz sessions featuring local and touring musicians.',
              date: '2025-09-28T20:00:00Z',
              location: 'New York, NY',
              price: '$30-50',
              category: 'Music',
              venue: 'Blue Note NYC',
              address: '131 W 3rd St, New York, NY 10012',
              latitude: 40.7282,
              longitude: -74.0016,
              ticketLink: 'https://tickets.example.com/blue-note'
            }
          ];
        case 'search-456':
          return [
            {
              id: uuidv4(),
              title: 'Brooklyn Food Truck Festival',
              description: 'The best food trucks in Brooklyn gathered in one location.',
              date: '2025-09-26T12:00:00Z',
              location: 'Brooklyn, NY',
              price: '$10-25',
              category: 'Food',
              venue: 'Brooklyn Bridge Park',
              address: 'Brooklyn Bridge Park, Brooklyn, NY 11201',
              latitude: 40.7006,
              longitude: -73.9969,
              ticketLink: 'https://tickets.example.com/food-festival'
            }
          ];
        case 'search-789':
          return [
            {
              id: uuidv4(),
              title: 'Chelsea Gallery Walk',
              description: 'Explore the latest exhibitions in Chelsea\'s premier art galleries.',
              date: '2025-10-02T18:00:00Z',
              location: 'Manhattan, NY',
              price: 'Free',
              category: 'Art',
              venue: 'Chelsea Art District',
              address: 'Multiple locations in Chelsea, Manhattan',
              latitude: 40.7465,
              longitude: -74.0014,
              ticketLink: null
            }
          ];
        default:
          return [];
      }
    };

    const events = getSearchResults(searchId as string);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Search not found'
      });
    }

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