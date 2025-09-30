import { useState, useCallback } from 'react';
import { SearchFilters } from './AdvancedSearchDropdown';
import { SearchSession } from './NavigationHeader';

export interface SearchSessionManager {
  sessions: SearchSession[];
  activeSessionId: string;
  createSession: (location: string, filters: SearchFilters) => string;
  updateSession: (sessionId: string, updates: Partial<SearchSession>) => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  getActiveSession: () => SearchSession | undefined;
  updateSessionResults: (sessionId: string, resultsCount: number) => void;
}

export function useSearchSessionManager(): SearchSessionManager {
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  const createSession = useCallback((location: string, filters: SearchFilters): string => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSession: SearchSession = {
      id: sessionId,
      location,
      filters: { ...filters },
      resultsCount: 0,
      lastUpdated: new Date(),
      cached: false
    };

    setSessions(prev => {
      // Limit to max 5 sessions
      const updatedSessions = [...prev, newSession];
      if (updatedSessions.length > 5) {
        updatedSessions.shift(); // Remove oldest session
      }
      return updatedSessions;
    });

    setActiveSessionId(sessionId);
    return sessionId;
  }, []);

  const updateSession = useCallback((sessionId: string, updates: Partial<SearchSession>) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates, lastUpdated: new Date() }
          : session
      )
    );
  }, []);

  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      
      // If we deleted the active session, switch to the first available
      if (sessionId === activeSessionId && filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveSessionId('');
      }
      
      return filtered;
    });
  }, [activeSessionId]);

  const getActiveSession = useCallback(() => {
    return sessions.find(session => session.id === activeSessionId);
  }, [sessions, activeSessionId]);

  const updateSessionResults = useCallback((sessionId: string, resultsCount: number) => {
    updateSession(sessionId, { 
      resultsCount, 
      cached: true,
      lastUpdated: new Date()
    });
  }, [updateSession]);

  return {
    sessions,
    activeSessionId,
    createSession,
    updateSession,
    switchSession,
    deleteSession,
    getActiveSession,
    updateSessionResults
  };
}

// Hook for managing search session state persistence
export function useSearchSessionPersistence(sessionManager: SearchSessionManager) {
  // Save sessions to localStorage
  const saveSessions = useCallback(() => {
    try {
      const sessionsData = {
        sessions: sessionManager.sessions,
        activeSessionId: sessionManager.activeSessionId
      };
      localStorage.setItem('whatsup_search_sessions', JSON.stringify(sessionsData));
    } catch (error) {
      console.warn('Failed to save search sessions to localStorage:', error);
    }
  }, [sessionManager.sessions, sessionManager.activeSessionId]);

  // Load sessions from localStorage
  const loadSessions = useCallback(() => {
    try {
      const saved = localStorage.getItem('whatsup_search_sessions');
      if (saved) {
        const sessionsData = JSON.parse(saved);
        return {
          sessions: sessionsData.sessions.map((session: any) => ({
            ...session,
            lastUpdated: new Date(session.lastUpdated)
          })),
          activeSessionId: sessionsData.activeSessionId
        };
      }
    } catch (error) {
      console.warn('Failed to load search sessions from localStorage:', error);
    }
    return null;
  }, []);

  return { saveSessions, loadSessions };
}

// Utility functions for session management
export const SessionUtils = {
  // Check if session results are stale (older than 5 minutes)
  isSessionStale: (session: SearchSession): boolean => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return session.lastUpdated < fiveMinutesAgo;
  },

  // Format session summary for display
  formatSessionSummary: (session: SearchSession): string => {
    const parts = [];
    
    if (session.filters.radius !== 25) {
      parts.push(`${session.filters.radius}km`);
    }
    
    if (session.filters.categories.length > 0) {
      if (session.filters.categories.length === 1) {
        parts.push(session.filters.categories[0]);
      } else {
        parts.push(`${session.filters.categories.length} Kategorien`);
      }
    }
    
    if (session.filters.timeRange && session.filters.timeRange !== 'all') {
      const timeRangeLabels: { [key: string]: string } = {
        'today': 'Heute',
        'tomorrow': 'Morgen',
        'thisWeek': 'Diese Woche',
        'thisWeekend': 'Wochenende',
        'nextWeek': 'Nächste Woche',
        'nextMonth': 'Nächsten Monat'
      };
      parts.push(timeRangeLabels[session.filters.timeRange] || 'Zeitraum');
    }
    
    if (session.filters.budget.onlyFree) {
      parts.push('Gratis');
    } else if (session.filters.budget.max !== 200) {
      parts.push(`bis CHF ${session.filters.budget.max}`);
    }
    
    if (session.filters.searchMode === 'discover') {
      parts.push('Entdecken-Modus');
    }
    
    return parts.join(' • ') || 'Alle Events';
  },

  // Get session status badge
  getSessionStatus: (session: SearchSession): { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    if (!session.cached) {
      return { text: 'Neu', variant: 'outline' };
    }
    
    if (SessionUtils.isSessionStale(session)) {
      return { text: 'Veraltet', variant: 'destructive' };
    }
    
    return { text: 'Aktuell', variant: 'secondary' };
  },

  // Generate session display name
  getSessionDisplayName: (session: SearchSession): string => {
    if (session.filters.keywords) {
      return `"${session.filters.keywords}" in ${session.location}`;
    }
    
    if (session.filters.categories.length === 1) {
      return `${session.filters.categories[0]} in ${session.location}`;
    }
    
    return session.location;
  }
};