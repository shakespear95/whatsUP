import { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { credential, clientId } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Google credential is required'
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as GoogleTokenPayload;

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    // Check if email is verified
    if (!payload.email_verified) {
      return res.status(401).json({
        success: false,
        error: 'Email not verified by Google'
      });
    }

    // TODO: In a real app, you'd check if the user exists in your database
    // For now, we'll create a user object from Google data
    const user = {
      id: payload.sub, // Google user ID
      username: payload.name || payload.email.split('@')[0],
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      isVerified: payload.email_verified,
      provider: 'google'
    };

    // TODO: Save user to database if they don't exist
    // TODO: Update user info if they do exist

    // Generate JWT tokens
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isVerified: user.isVerified,
        provider: user.provider
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '30d' }
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
          name: user.name,
          picture: user.picture,
          isVerified: user.isVerified,
          provider: user.provider
        }
      },
      message: 'Google authentication successful'
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
}