import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface LoginRequest {
  username: string;
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
    const { username, password, rememberMe }: LoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // TODO: Replace with actual database query
    // For now, using mock user data
    const mockUsers = [
      {
        id: '1',
        username: 'demo',
        email: 'demo@eventfinder.com',
        password: await bcrypt.hash('password', 10), // 'password'
        isVerified: true
      }
    ];

    const user = mockUsers.find(u => u.username === username);

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const tokenExpiry = rememberMe ? '30d' : '24h';
    const refreshTokenExpiry = '30d';

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: tokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: refreshTokenExpiry }
    );

    // TODO: Store refresh token in database

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}