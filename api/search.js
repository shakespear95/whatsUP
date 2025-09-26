export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const searchData = req.body;

  if (!searchData.location || !searchData.activity_type || !searchData.timeframe) {
    return res.status(400).json({
      success: false,
      error: 'Location, activity type, and timeframe are required'
    });
  }

  // Generate mock search results
  const mockEvents = [
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
    }
  ];

  if (searchData.keywords) {
    mockEvents.forEach(event => {
      event.title += ` - ${searchData.keywords}`;
    });
  }

  res.status(200).json({
    success: true,
    data: {
      events: mockEvents,
      totalResults: mockEvents.length,
      searchId: `search-${Date.now()}`
    }
  });
}