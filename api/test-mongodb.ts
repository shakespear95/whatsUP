import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from './lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test MongoDB connection
    const db = await getDatabase();

    // Try to access the database
    const collections = await db.listCollections().toArray();

    // Test a simple operation
    const testCollection = db.collection('test');
    const testDoc = { message: 'Database connection successful!', timestamp: new Date() };
    await testCollection.insertOne(testDoc);

    // Clean up test document
    await testCollection.deleteOne({ message: 'Database connection successful!' });

    res.status(200).json({
      success: true,
      message: 'MongoDB connection successful!',
      database: 'eventfinder',
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString(),
      connectionString: process.env.MONGODB_URI ? 'Configured' : 'Missing'
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({
      success: false,
      error: 'MongoDB connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      connectionString: process.env.MONGODB_URI ? 'Configured' : 'Missing'
    });
  }
}