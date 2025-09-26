import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password, rememberMe }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Demo authentication - accept any email/password for testing
    // In real app, this would validate against database
    const user = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: email
    };

    const tokenExpiry = rememberMe ? '30d' : '24h';
    const refreshTokenExpiry = '30d';

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: tokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: refreshTokenExpiry }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      message: 'Login successful (demo mode - no database)'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}