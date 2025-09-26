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

export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  picture?: string;
  isVerified?: boolean;
  provider?: 'local' | 'google';
}

export interface SearchFormData {
  location: string;
  activity_type: string;
  timeframe: string;
  radius?: number;
  keywords?: string;
  email?: string;
}

export interface SearchHistoryItem {
  id: string;
  searchId: string;
  searchCriteria: SearchFormData;
  timestamp: string;
  resultsCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface SearchResponse {
  events: Event[];
  totalResults: number;
  searchId?: string;
}