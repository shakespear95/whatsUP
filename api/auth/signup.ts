import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { username, email, password }: SignupRequest = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // TODO: Replace with actual database operations
    // For now, simulating user creation
    const mockUsers = [
      {
        id: '1',
        username: 'demo',
        email: 'demo@eventfinder.com',
        password: await bcrypt.hash('password', 10),
        isVerified: true
      }
    ];

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    // TODO: Save user to database
    // TODO: Send verification email

    const token = jwt.sign(
      {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isVerified: newUser.isVerified
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          isVerified: newUser.isVerified
        }
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}