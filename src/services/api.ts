import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, AUTH_CONFIG } from '../config/constants';
import {
  ApiResponse,
  AuthResponse,
  SearchResponse,
  SearchFormData,
  SearchHistoryItem,
  User
} from '../types';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const refreshResponse = await authService.refreshToken(refreshToken);
          if (refreshResponse.success && refreshResponse.data) {
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, refreshResponse.data.token);

            // Retry the original request
            error.config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return apiClient.request(error.config);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          authService.logout();
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username: string, password: string, rememberMe: boolean): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/login', {
        username,
        password,
        rememberMe
      });

      if (response.data.success && response.data.data) {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.data.data.refreshToken);
        }
        if (rememberMe) {
          localStorage.setItem(AUTH_CONFIG.REMEMBER_ME_KEY, 'true');
        }
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  async signup(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/signup', {
        username,
        email,
        password
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed'
      };
    }
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ token: string }>> = await apiClient.post('/auth/refresh', {
        refreshToken
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Token refresh failed'
      };
    }
  },

  logout(): void {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REMEMBER_ME_KEY);
  },

  getCurrentUser(): User | null {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        isVerified: payload.isVerified
      };
    } catch (error) {
      return null;
    }
  },

  async loginWithGoogle(credential: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/google', {
        credential
      });

      if (response.data.success && response.data.data) {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, response.data.data.refreshToken);
        }
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Google login failed'
      };
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }
};

export const searchService = {
  async searchEvents(searchData: SearchFormData): Promise<ApiResponse<SearchResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<SearchResponse>> = await apiClient.post('/search', searchData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Search failed'
      };
    }
  },

  async getFeaturedEvents(): Promise<ApiResponse<{ events: any[] }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ events: any[] }>> = await apiClient.get('/featured-events');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load featured events'
      };
    }
  }
};

export const userService = {
  async getSearchHistory(userId: string): Promise<ApiResponse<SearchHistoryItem[]>> {
    try {
      const response: AxiosResponse<ApiResponse<SearchHistoryItem[]>> = await apiClient.get(`/user/search-history/${userId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load search history'
      };
    }
  },

  async getSearchDetails(searchId: string): Promise<ApiResponse<{ events: any[] }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ events: any[] }>> = await apiClient.get(`/user/search-details/${searchId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load search details'
      };
    }
  }
};