// Use relative paths for Vercel serverless functions
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3000/api';

export const AUTH_CONFIG = {
  TOKEN_KEY: 'jwtToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  REMEMBER_ME_KEY: 'rememberMe',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
  AUTO_REFRESH_INTERVAL: 10 * 60 * 1000, // Check every 10 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000 // 30 days
};

export const SEARCH_CONFIG = {
  ACTIVITY_TYPES: [
    'Any',
    'Music',
    'Food',
    'Workshop',
    'Outdoor',
    'Art',
    'Sports'
  ],
  TIMEFRAMES: [
    'Today',
    'Tomorrow',
    'This Weekend',
    'Next Week',
    'This Month'
  ]
};