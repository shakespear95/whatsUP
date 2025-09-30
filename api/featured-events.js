export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // Generate dynamic featured events
  const featuredEvents = generateDynamicFeaturedEvents();

  res.status(200).json({
    success: true,
    data: {
      events: featuredEvents,
      generatedAt: new Date().toISOString(),
      count: featuredEvents.length
    }
  });
}

function generateDynamicFeaturedEvents() {
  const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Miami, FL', 'Seattle, WA'];
  const eventTemplates = [
    {
      titleTemplate: 'Underground Music Scene: {genre} Night',
      categories: ['Electronic', 'Indie Rock', 'Jazz Fusion', 'Hip-Hop', 'Alternative'],
      descriptions: [
        'Dive into the city\'s underground music scene with cutting-edge artists and immersive sound experiences.',
        'Discover emerging talent in an intimate venue that\'s been shaping the local music landscape.',
        'Experience raw, unfiltered performances from artists pushing the boundaries of their genre.'
      ],
      venues: ['The Underground', 'Hidden Venue', 'Secret Sessions', 'Basement Collective'],
      priceRange: '$15-35'
    },
    {
      titleTemplate: 'Artisan Market & {theme} Workshop',
      categories: ['Pottery', 'Woodworking', 'Jewelry Making', 'Printmaking', 'Glassblowing'],
      descriptions: [
        'Learn traditional crafts from master artisans while browsing unique handmade goods.',
        'Interactive workshop combined with a curated market featuring local makers and creators.',
        'Hands-on experience where you create your own piece to take home while supporting local artists.'
      ],
      venues: ['Makers Collective', 'Artisan Quarter', 'Creative Commons', 'Craft District'],
      priceRange: '$20-45'
    },
    {
      titleTemplate: 'Culinary Adventure: {cuisine} Street Food Tour',
      categories: ['Korean BBQ', 'Mexican Fusion', 'Mediterranean', 'Asian Fusion', 'Farm-to-Table'],
      descriptions: [
        'Guided tour through the city\'s best hidden food gems with tastings at multiple locations.',
        'Explore authentic flavors and meet the passionate chefs behind these incredible dishes.',
        'Small-group food tour featuring family-owned restaurants and innovative food trucks.'
      ],
      venues: ['Food District', 'Culinary Quarter', 'Market Street', 'Food Hall'],
      priceRange: '$35-55'
    },
    {
      titleTemplate: 'Immersive {experience} Experience',
      categories: ['Virtual Reality Art', 'Interactive Theater', 'Sound Bath', 'Light Installation', 'Sensory Journey'],
      descriptions: [
        'Step into a fully immersive world that blends technology, art, and storytelling.',
        'Multi-sensory experience that challenges perception and creates lasting memories.',
        'Limited engagement where participants become part of the artistic narrative.'
      ],
      venues: ['Experience Center', 'Immersion Lab', 'Future Space', 'Digital Gallery'],
      priceRange: '$25-40'
    },
    {
      titleTemplate: '{sport} Community Championship',
      categories: ['Rock Climbing', 'Beach Volleyball', 'Urban Running', 'Skateboarding', 'Cycling'],
      descriptions: [
        'Competitive event bringing together enthusiasts of all skill levels for friendly competition.',
        'Community-focused tournament with prizes, coaching clinics, and networking opportunities.',
        'Annual championship featuring local teams and individual competitions with spectator activities.'
      ],
      venues: ['Community Sports Center', 'Urban Park', 'Recreation Complex', 'Athletic Grounds'],
      priceRange: '$10-25'
    },
    {
      titleTemplate: 'Tech Innovation: {topic} Meetup',
      categories: ['AI & Machine Learning', 'Blockchain', 'Sustainable Tech', 'AR/VR Development', 'IoT'],
      descriptions: [
        'Connect with innovators and learn about cutting-edge technologies shaping our future.',
        'Networking event featuring demos, talks, and hands-on workshops with industry experts.',
        'Collaborative meetup where developers, entrepreneurs, and tech enthusiasts share ideas.'
      ],
      venues: ['Innovation Hub', 'Tech Campus', 'Startup Incubator', 'Digital Commons'],
      priceRange: 'Free'
    }
  ];

  const featuredEvents = [];
  const usedCombinations = new Set();

  // Generate 6-8 unique events
  for (let i = 0; i < Math.floor(Math.random() * 3) + 6; i++) {
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const category = template.categories[Math.floor(Math.random() * template.categories.length)];

    const combination = `${template.titleTemplate}-${category}-${location}`;
    if (usedCombinations.has(combination)) {
      continue; // Skip duplicate combinations
    }
    usedCombinations.add(combination);

    const title = template.titleTemplate.replace(/{(\w+)}/g, (match, key) => {
      if (key === 'genre' || key === 'theme' || key === 'cuisine' || key === 'experience' || key === 'sport' || key === 'topic') {
        return category;
      }
      return match;
    });

    const event = {
      id: `featured-${Date.now()}-${i}`,
      title: title,
      description: template.descriptions[Math.floor(Math.random() * template.descriptions.length)],
      date: generateFeaturedDate(i),
      time: generateFeaturedTime(),
      location: location,
      price: template.priceRange,
      category: category,
      venue: template.venues[Math.floor(Math.random() * template.venues.length)] + ' ' + location.split(',')[0],
      address: generateAddress(location),
      image: getFeaturedEventImage(category.toLowerCase()),
      specialFeature: generateSpecialFeature(),
      source: 'Featured',
      featured: true,
      tickets: generateTicketLink(template.priceRange),
      tags: generateEventTags(category, location),
      popularity: Math.floor(Math.random() * 500) + 100
    };

    featuredEvents.push(event);
  }

  return featuredEvents;
}

function generateFeaturedDate(index) {
  const now = new Date();
  const daysAhead = Math.floor(Math.random() * 14) + 1; // 1-14 days ahead
  const eventDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return eventDate.toISOString().split('T')[0];
}

function generateFeaturedTime() {
  const hours = [14, 15, 16, 17, 18, 19, 20, 21]; // 2 PM to 9 PM
  const minutes = ['00', '30'];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  return `${hour}:${minute}`;
}

function generateAddress(location) {
  const streetNumbers = Math.floor(Math.random() * 999) + 1;
  const streetNames = ['Main St', 'Broadway', 'Oak Ave', 'Elm St', 'Park Ave', 'Center St', 'First Ave', 'Market St'];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  return `${streetNumbers} ${streetName}, ${location}`;
}

function getFeaturedEventImage(category) {
  const imageMap = {
    'electronic': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'jazz fusion': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'pottery': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    'woodworking': 'https://images.unsplash.com/photo-1581618047805-7c7093c55f36?w=800',
    'korean bbq': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
    'mexican fusion': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
    'virtual reality art': 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=800',
    'rock climbing': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800',
    'ai & machine learning': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    'default': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
  };

  return imageMap[category] || imageMap.default;
}

function generateSpecialFeature() {
  const features = [
    'Limited capacity event',
    'Meet & greet with creators',
    'Free refreshments included',
    'Take-home materials provided',
    'Professional photo session',
    'Networking hour included',
    'Live streaming available',
    'Interactive Q&A session',
    'Signed memorabilia giveaway',
    'VIP seating available'
  ];

  return features[Math.floor(Math.random() * features.length)];
}

function generateTicketLink(priceRange) {
  if (priceRange === 'Free') {
    return { type: 'free' };
  }

  const ticketTypes = [
    { type: 'link', value: 'https://eventbrite.com/tickets', label: 'Get Tickets' },
    { type: 'website', value: 'https://venue-tickets.com', label: 'Visit Website' },
    { type: 'phone', value: '(555) 123-FEAT', label: 'Call for Tickets' }
  ];

  return ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
}

function generateEventTags(category, location) {
  const baseTags = [category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')];
  const locationTag = location.split(',')[0].toLowerCase().replace(/ /g, '-');
  baseTags.push(locationTag);

  const additionalTags = ['featured', 'popular', 'limited', 'exclusive', 'trending'];
  baseTags.push(additionalTags[Math.floor(Math.random() * additionalTags.length)]);

  return baseTags.slice(0, 3);
}