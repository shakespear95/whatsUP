export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // Return mock featured events
  const mockEvents = [
    {
      id: '1',
      title: 'Live Jazz Night',
      description: 'Experience incredible live jazz music in an intimate setting.',
      date: '2025-09-27T20:00:00Z',
      location: 'New York, NY',
      price: '$25-40',
      category: 'Music',
      venue: 'Blue Note NYC',
      address: '131 W 3rd St, New York, NY 10012'
    },
    {
      id: '2',
      title: 'Food Truck Festival',
      description: 'Taste amazing food from the best food trucks in the city.',
      date: '2025-09-28T12:00:00Z',
      location: 'Brooklyn, NY',
      price: '$10-30',
      category: 'Food',
      venue: 'Brooklyn Bridge Park',
      address: 'Brooklyn Bridge Park, Brooklyn, NY 11201'
    },
    {
      id: '3',
      title: 'Art Gallery Opening',
      description: 'Discover new contemporary art and meet local artists.',
      date: '2025-09-29T18:00:00Z',
      location: 'Manhattan, NY',
      price: 'Free',
      category: 'Art',
      venue: 'Chelsea Gallery District',
      address: 'Multiple locations in Chelsea'
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      events: mockEvents
    }
  });
}