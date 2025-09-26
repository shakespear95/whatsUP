// Simple API index endpoint
export default function handler(req, res) {
  res.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    available_endpoints: [
      'GET /api/hello',
      'GET /api/featured-events',
      'POST /api/search'
    ]
  });
}