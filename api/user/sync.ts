import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from '../lib/mongodb';
import { User, COLLECTIONS } from '../lib/models';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clerkId, email, name, imageUrl } = req.body;

    if (!clerkId || !email || !name) {
      return res.status(400).json({
        error: 'Missing required fields: clerkId, email, name'
      });
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>(COLLECTIONS.USERS);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ clerkId });

    if (existingUser) {
      // Update existing user
      await usersCollection.updateOne(
        { clerkId },
        {
          $set: {
            email,
            name,
            imageUrl,
            updatedAt: new Date()
          }
        }
      );

      return res.status(200).json({
        success: true,
        message: 'User updated successfully'
      });
    } else {
      // Create new user
      const newUser: User = {
        clerkId,
        email,
        name,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await usersCollection.insertOne(newUser);

      return res.status(201).json({
        success: true,
        message: 'User created successfully'
      });
    }
  } catch (error) {
    console.error('User sync error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}