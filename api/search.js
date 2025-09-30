export default async function handler(req, res) {
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

  try {
    // Try AI-powered search first
    const response = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData)
    });

    if (response.ok) {
      const aiResult = await response.json();
      if (aiResult.success && aiResult.data.events.length > 0) {
        return res.status(200).json(aiResult);
      }
    }
  } catch (error) {
    console.log('AI search failed, falling back to enhanced mock:', error.message);
  }

  // Enhanced fallback with better mock data
  const enhancedEvents = generateSmartMockEvents(searchData);

  res.status(200).json({
    success: true,
    data: {
      events: enhancedEvents,
      totalResults: enhancedEvents.length,
      searchId: `enhanced-search-${Date.now()}`,
      fallback: true
    }
  });
}

function generateSmartMockEvents(searchData) {
  const { location, activity_type, timeframe, budget, keywords } = searchData;

  const smartEvents = [
    {
      id: `smart-${Date.now()}-1`,
      title: `${activity_type} Masterclass in ${location}`,
      description: `Professional ${activity_type.toLowerCase()} workshop led by industry experts. Learn advanced techniques and network with fellow enthusiasts.`,
      date: getSmartDate(timeframe, 1),
      time: '14:00',
      location: location,
      venue: `${location} Professional Center`,
      address: `${Math.floor(Math.random() * 999) + 1} Workshop Blvd, ${location}`,
      price: budget || '$25-45',
      category: activity_type,
      specialFeature: 'Certificate provided',
      image: getActivityImage(activity_type),
      source: 'Enhanced Search',
      tickets: { type: 'link', value: '#', label: 'Register Now' }
    },
    {
      id: `smart-${Date.now()}-2`,
      title: `${location} ${activity_type} Festival`,
      description: `Annual celebration featuring the best ${activity_type.toLowerCase()} in the region. Multiple stages, food vendors, and interactive experiences.`,
      date: getSmartDate(timeframe, 3),
      time: '12:00',
      location: location,
      venue: `${location} Festival Grounds`,
      address: `Festival Park, ${location}`,
      price: budget || 'Free',
      category: activity_type,
      specialFeature: 'All-day festival',
      image: getActivityImage(activity_type),
      source: 'Enhanced Search',
      tickets: { type: 'website', value: '#', label: 'Festival Info' }
    },
    {
      id: `smart-${Date.now()}-3`,
      title: `Intimate ${activity_type} Experience`,
      description: `Small-group ${activity_type.toLowerCase()} session in a cozy, atmospheric setting. Perfect for those seeking a more personal experience.`,
      date: getSmartDate(timeframe, 5),
      time: '19:30',
      location: location,
      venue: `The ${activity_type} Lounge`,
      address: `${Math.floor(Math.random() * 99) + 1} Intimate St, ${location}`,
      price: budget || '$15-30',
      category: activity_type,
      specialFeature: 'Limited to 25 people',
      image: getActivityImage(activity_type),
      source: 'Enhanced Search',
      tickets: { type: 'phone', value: '(555) 123-4567', label: 'Reserve Spot' }
    },
    {
      id: `smart-${Date.now()}-4`,
      title: `${activity_type} & Community Meetup`,
      description: `Connect with local ${activity_type.toLowerCase()} enthusiasts in a relaxed, welcoming environment. Great for beginners and experts alike.`,
      date: getSmartDate(timeframe, 7),
      time: '18:00',
      location: location,
      venue: `${location} Community Hub`,
      address: `Community Center, ${location}`,
      price: 'Free',
      category: activity_type,
      specialFeature: 'Networking & refreshments included',
      image: getActivityImage(activity_type),
      source: 'Enhanced Search',
      tickets: { type: 'free' }
    }
  ];

  // Add keywords to titles if provided
  if (keywords) {
    smartEvents.forEach(event => {
      event.title = `${event.title} - ${keywords}`;
      event.description = `${event.description} Features: ${keywords}.`;
    });
  }

  return smartEvents;
}

function getSmartDate(timeframe, daysOffset) {
  const now = new Date();
  let targetDate = new Date(now);

  switch (timeframe.toLowerCase()) {
    case 'today':
      targetDate.setHours(targetDate.getHours() + daysOffset);
      break;
    case 'this week':
      targetDate.setDate(now.getDate() + daysOffset);
      break;
    case 'next week':
      targetDate.setDate(now.getDate() + 7 + daysOffset);
      break;
    case 'this month':
      targetDate.setDate(now.getDate() + daysOffset * 2);
      break;
    case 'next month':
      targetDate.setMonth(now.getMonth() + 1);
      targetDate.setDate(daysOffset * 3);
      break;
    default:
      targetDate.setDate(now.getDate() + daysOffset);
  }

  return targetDate.toISOString().split('T')[0];
}

function getActivityImage(activity) {
  const imageMap = {
    'Music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'Art': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    'Sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    'Food': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'Tech': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    'Workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    'Festival': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    'Concert': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    'Theater': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'
  };

  return imageMap[activity] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
}