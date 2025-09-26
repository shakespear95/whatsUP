import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

interface RefreshRequest {
  refreshToken: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { refreshToken }: RefreshRequest = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
    ) as { userId: string };

    // TODO: Check if refresh token exists in database and is not revoked

    // For now, using mock user data
    const mockUser = {
      id: decoded.userId,
      username: 'demo',
      email: 'demo@eventfinder.com',
      isVerified: true
    };

    // Generate new access token
    const newToken = jwt.sign(
      {
        userId: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        isVerified: mockUser.isVerified
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
}