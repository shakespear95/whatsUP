import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    success: true,
    message: 'API is working!',
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasPostgres: !!process.env.POSTGRES_URL
  });
}