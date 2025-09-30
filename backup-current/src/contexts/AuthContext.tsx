import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on app load
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await authService.login(email, password, rememberMe);

      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await authService.signup(name, email, password);

      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await authService.loginWithGoogle(credential);

      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Google login failed:', error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithGoogle,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};