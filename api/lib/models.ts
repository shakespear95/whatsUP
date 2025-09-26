import { ObjectId } from 'mongodb';

// User interface for MongoDB
export interface User {
  _id?: ObjectId;
  clerkId: string; // Clerk user ID
  email: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Search interface for MongoDB
export interface UserSearch {
  _id?: ObjectId;
  userId: string; // Clerk user ID
  searchQuery: {
    location: string;
    activity_type: string;
    timeframe: string;
    radius?: number;
    keywords?: string;
    email?: string;
  };
  results: Event[];
  location: string;
  activityType: string;
  timeframe: string;
  searchRadius?: number;
  createdAt: Date;
}

// Event interface
export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  price: string;
  category: string;
  ticketLink?: string;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  SEARCHES: 'user_searches'
} as const;