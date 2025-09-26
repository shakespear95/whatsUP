import { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { query } from '../lib/db';

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

    // Check if user exists in database
    let userResult = await query(
      'SELECT id, name, email FROM users WHERE google_id = $1 OR email = $2',
      [payload.sub, payload.email]
    );

    let user;
    if (userResult.rows.length > 0) {
      // User exists, update their info
      user = userResult.rows[0];
      await query(
        'UPDATE users SET name = $1, google_id = $2, updated_at = NOW() WHERE id = $3',
        [payload.name, payload.sub, user.id]
      );
    } else {
      // Create new user
      const newUserResult = await query(
        'INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING id, name, email',
        [payload.name, payload.email, payload.sub]
      );
      user = newUserResult.rows[0];
    }

    // Generate JWT tokens
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        provider: 'google'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          provider: 'google'
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