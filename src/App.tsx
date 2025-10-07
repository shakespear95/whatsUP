import { useState, useMemo, useEffect } from 'react';
import { Event } from './types';
import { SimpleNavigationHeader, SimpleSearchSession, SearchHistoryEntry, SavedSearchTemplate, QuickFilterState } from './components/SimpleNavigationHeader';
import { AdvancedSearchDropdown } from './components/AdvancedSearchDropdown';
import { EventCard } from './components/EventCard';
import { MapView } from './components/MapView';
import { AdvancedStartScreen } from './components/AdvancedStartScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SearchFilters } from './components/AdvancedSearchDropdown';
import { Button } from './components/ui/button';

// No mock events - using real AI-powered search only
const mockEvents: Event[] = [];

export default function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSearchMode, setShowSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  // Demo mode removed - using AI-powered search
  const [searchResults, setSearchResults] = useState<Event[]>([]);

  // Favorites management
  const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(new Set());
  
  // Simplified session management
  const [sessions, setSessions] = useState<SimpleSearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  
  // Search History management
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedSearchTemplate[]>([
    {
      id: 'template-1',
      name: 'Weekend-Familie',
      location: 'Beliebiger Ort',
      filters: {
        categories: ['familie'],
        timeRange: 'thisWeekend',
        budget: { onlyFree: false, min: 0, max: 50 }
      }
    }
  ]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    useCurrentLocation: false,
    radius: 25,
    categories: [],
    subcategories: [],
    timeRange: 'thisWeek',
    dateFrom: undefined,
    dateTo: undefined,
    budget: {
      min: 0,
      max: 200,
      onlyFree: false
    },
    keywords: '',
    quickFilters: [],
    specialTags: [],
    searchMode: 'standard',
    eventFrequency: [],
    advancedFilters: {
      accessibility: [],
      ageGroups: [],
      features: [],
      catering: []
    }
  });

  // Simple session creation
  const createSession = (location: string, resultsCount: number = 0) => {
    const sessionId = `session_${Date.now()}`;
    const newSession: SimpleSearchSession = {
      id: sessionId,
      location,
      resultsCount
    };
    
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(sessionId);
    return sessionId;
  };

  const handleStartSearch = async (searchFilters: SearchFilters) => {
    setFilters(searchFilters);

    // Add to search history
    const historyEntry: SearchHistoryEntry = {
      id: `history_${Date.now()}`,
      location: searchFilters.location || 'Unknown',
      radius: searchFilters.radius || 25,
      filters: searchFilters.categories || [],
      timestamp: new Date(),
      resultsCount: 0 // Will be updated later
    };
    setSearchHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 searches

    // Create session and trigger real search
    const sessionId = createSession(searchFilters.location || 'Unknown');

    // Call Supabase search function
    console.log('🚀 Starting REAL EVENT SEARCH:', searchFilters);
    try {
      // Import searchEvents from Supabase client
      const { searchEvents } = await import('./lib/supabase');

      const searchData = {
        location: searchFilters.location,
        activity_type: searchFilters.categories[0] || 'Events',
        timeframe: 'this week',
        budget: searchFilters.budget?.max ? `$0-${searchFilters.budget.max}` : undefined,
        keywords: searchFilters.keywords
      };

      console.log('📡 Calling Supabase search-events function...');
      const result = await searchEvents(searchData);
      console.log('✅ Search API Response:', result);

      if (result.success && result.data.events) {
        // Map Supabase events to frontend format
        const mappedEvents = result.data.events.map((event: any) => ({
          ...event,
          image: event.image_url || event.image,
          exactAddress: event.address || event.exactAddress,
          ticketLink: event.ticket_link || event.ticketLink,
          specialFeature: event.special_feature || event.specialFeature
        }));

        setSearchResults(mappedEvents);
        console.log(`🎯 Found ${mappedEvents.length} real events`, mappedEvents);
      } else {
        console.log('❌ Search failed:', result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('🔥 Search API Error:', error);
      setSearchResults([]);
    }

    setShowStartScreen(false);
  };

  const handleSessionSwitch = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleNewSearch = () => {
    setShowStartScreen(true);
  };

  const handleQuickFilter = (quickFilters: Partial<SearchFilters>) => {
    // Deep merge filters to properly handle nested objects like budget
    const updatedFilters: SearchFilters = {
      ...filters,
      ...quickFilters,
      // Handle budget merge specially to avoid overwriting other budget properties
      budget: quickFilters.budget ? {
        ...filters.budget,
        ...quickFilters.budget
      } : filters.budget,
      // Handle advancedFilters merge specially
      advancedFilters: quickFilters.advancedFilters ? {
        ...filters.advancedFilters,
        ...quickFilters.advancedFilters
      } : filters.advancedFilters
    };
    setFilters(updatedFilters);
  };

  const handleAdvancedFilters = () => {
    setShowAdvancedFilters(true);
  };

  const handleSearchModeToggle = () => {
    setShowSearchMode(!showSearchMode);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // Automatically close search mode when filters are applied
    setShowSearchMode(false);
  };

  // Search History handlers
  const handleLoadSearch = (searchId: string) => {
    const search = searchHistory.find(s => s.id === searchId);
    if (search) {
      const loadedFilters: SearchFilters = {
        ...filters,
        location: search.location,
        radius: search.radius,
        categories: search.filters || []
      };
      setFilters(loadedFilters);
      createSession(search.location, search.resultsCount);
    }
  };

  const handleDeleteSearch = (searchId: string) => {
    setSearchHistory(prev => prev.filter(s => s.id !== searchId));
  };

  const handleApplyTemplate = (template: SavedSearchTemplate) => {
    const templateFilters: SearchFilters = {
      ...filters,
      ...template.filters,
      location: template.location === 'Beliebiger Ort' ? filters.location : template.location
    };
    setFilters(templateFilters);
    if (template.location !== 'Beliebiger Ort') {
      createSession(template.location);
    }
  };

  const handleClearAllHistory = () => {
    setSearchHistory([]);
  };

  // Quick Filter handlers
  const handleQuickFilterChange = (quickFilters: QuickFilterState) => {
    // Store quick filter state for UI
    console.log('Quick filters updated:', quickFilters);
  };

  // Favorites handlers
  const toggleFavorite = (eventId: string) => {
    setFavoriteEvents(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const isFavorite = (eventId: string) => {
    return favoriteEvents.has(eventId);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Enhanced filtering with real search results
  const filteredEvents = useMemo(() => {
    console.log('🔍 Filtering events:', searchResults.length, 'results');
    console.log('📋 Active filters:', filters);

    let events = searchResults.filter(event => {
      // Favorites-only filter (applied first)
      if (filters.showFavoritesOnly === true) {
        if (!favoriteEvents.has(event.id)) return false;
      }

      // Keywords filter
      if (filters.keywords && filters.keywords.trim()) {
        const keywords = filters.keywords.toLowerCase();
        const matchesKeywords = 
          event.title.toLowerCase().includes(keywords) ||
          event.location.toLowerCase().includes(keywords) ||
          event.category.toLowerCase().includes(keywords) ||
          (event.description && event.description.toLowerCase().includes(keywords));
        if (!matchesKeywords) return false;
      }

      // Category filter
      if (filters.categories.length > 0 || filters.subcategories.length > 0) {
        const categoryMapping: { [key: string]: string[] } = {
          'konzerte': ['konzert', 'club'],
          'buehne': ['theater'],
          'kunst': ['ausstellung'],
          'familie': ['kinder'],
          'sport': ['sport'],
          'messen': ['markt'],
          'kulinarik': ['festival'],
          'wissen': ['workshop'],
          'specials': ['special'],
          // New unique categories
          'unique-underground': ['underground', 'pop-up', 'secret', 'alternative'],
          'community-spontan': ['community', 'spontan', 'nachbarschaft'],
          'random-weird': ['weird', 'kurios', 'mystery', 'random']
        };
        
        let matchesCategory = false;
        
        // Check main categories
        if (filters.categories.length > 0) {
          for (const category of filters.categories) {
            const allowedCategories = categoryMapping[category] || [category];
            if (allowedCategories.some(cat => event.category.toLowerCase().includes(cat))) {
              matchesCategory = true;
              break;
            }
          }
        }
        
        // Check subcategories
        if (!matchesCategory && filters.subcategories.length > 0) {
          for (const subcategory of filters.subcategories) {
            if (event.category.toLowerCase().includes(subcategory.replace('-', ' ')) ||
                event.title.toLowerCase().includes(subcategory.replace('-', ' ')) ||
                (event.description && event.description.toLowerCase().includes(subcategory.replace('-', ' ')))) {
              matchesCategory = true;
              break;
            }
          }
        }
        
        if (!matchesCategory) return false;
      }

      // Time range filter (Quick Filter compatibility)
      const eventDate = new Date(event.date);
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()));
      
      // Apply time range filters
      if (filters.timeRange) {
        switch (filters.timeRange) {
          case 'now':
            // Events happening within the next 3 hours
            const nowPlus3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
            if (eventDate < now || eventDate > nowPlus3Hours) return false;
            break;
          case 'today':
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            if (eventDate < today || eventDate > todayEnd) return false;
            break;
          case 'tomorrow':
            const tomorrowEnd = new Date(tomorrow);
            tomorrowEnd.setHours(23, 59, 59, 999);
            if (eventDate < tomorrow || eventDate > tomorrowEnd) return false;
            break;
          case 'thisWeekend':
            const saturday = new Date(today);
            saturday.setDate(saturday.getDate() + (6 - today.getDay()));
            const sundayEnd = new Date(saturday);
            sundayEnd.setDate(sundayEnd.getDate() + 1);
            sundayEnd.setHours(23, 59, 59, 999);
            if (eventDate < saturday || eventDate > sundayEnd) return false;
            break;
          case 'thisWeek':
            // Default behavior - show events for this week
            if (eventDate < today || eventDate > thisWeekEnd) return false;
            break;
        }
      }
      
      // Custom date range filter (from advanced filters)
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (eventDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (eventDate > toDate) return false;
      }

      // Budget/Price filter
      if (filters.budget) {
        // Free events filter
        if (filters.budget.onlyFree) {
          if (event.price && !event.price.toLowerCase().includes('gratis') && !event.tickets?.type === 'free') {
            return false;
          }
        } else {
          // Price range filter
          if (event.price && filters.budget.max !== undefined) {
            const priceMatch = event.price.match(/(\d+)/);
            if (priceMatch) {
              const eventPrice = parseInt(priceMatch[1]);
              if (eventPrice > filters.budget.max) return false;
              if (filters.budget.min !== undefined && eventPrice < filters.budget.min) return false;
            }
          }
        }
      }

      // Special tags filter
      if (filters.specialTags && filters.specialTags.length > 0) {
        const hasSpecialTag = filters.specialTags.some(tag => {
          switch (tag) {
            case 'indoor':
              return !event.category.toLowerCase().includes('outdoor') && 
                     !event.description?.toLowerCase().includes('outdoor');
            case 'barrierefrei':
              return event.description?.toLowerCase().includes('barrierefrei') ||
                     event.description?.toLowerCase().includes('accessible');
            case 'familien':
              return event.category.toLowerCase().includes('familie') ||
                     event.category.toLowerCase().includes('kinder') ||
                     event.description?.toLowerCase().includes('familie') ||
                     event.description?.toLowerCase().includes('kinder');
            case 'tickets':
              return event.tickets?.type === 'link' || event.tickets?.type === 'website';
            default:
              return false;
          }
        });
        if (!hasSpecialTag) return false;
      }

      // Location and radius filter (simplified - in real app would use geocoding)
      if (filters.location && filters.location.trim()) {
        // For demo purposes, we'll just do a simple string match
        // In a real app, you'd geocode the location and calculate actual distances
        const locationMatch = event.location.toLowerCase().includes(filters.location.toLowerCase());
        if (!locationMatch) {
          // Simple distance simulation based on known Swiss cities
          const swissCities = {
            'zürich': { lat: 47.3769, lon: 8.5417 },
            'basel': { lat: 47.5596, lon: 7.5886 },
            'bern': { lat: 46.9481, lon: 7.4474 },
            'st. gallen': { lat: 47.4245, lon: 9.3767 }
          };
          
          const searchLocation = swissCities[filters.location.toLowerCase() as keyof typeof swissCities];
          if (searchLocation && filters.radius) {
            const distance = calculateDistance(
              searchLocation.lat, searchLocation.lon,
              event.latitude, event.longitude
            );
            if (distance > filters.radius) return false;
          }
        }
      }

      return true;
    });

    // Ensure we always have results
    if (events.length === 0) {
      // If no events match strict filters, apply relaxed filtering
      events = searchResults.filter(event => {
        // Keep favorites filter and keywords as they are important
        if (filters.showFavoritesOnly === true && !favoriteEvents.has(event.id)) return false;
        
        if (filters.keywords && filters.keywords.trim()) {
          const keywords = filters.keywords.toLowerCase();
          const matchesKeywords = 
            event.title.toLowerCase().includes(keywords) ||
            event.location.toLowerCase().includes(keywords) ||
            event.category.toLowerCase().includes(keywords) ||
            (event.description && event.description.toLowerCase().includes(keywords));
          if (!matchesKeywords) return false;
        }
        
        // Relax category filter - if no exact match, show similar categories
        if (filters.categories.length > 0) {
          const categoryMapping: { [key: string]: string[] } = {
            'konzerte': ['konzert', 'club', 'musik', 'jazz', 'techno'],
            'buehne': ['theater', 'performance', 'show'],
            'kunst': ['ausstellung', 'museum', 'galerie', 'kunst', 'vintage'],
            'familie': ['kinder', 'familie', 'familie', 'bastel'],
            'sport': ['sport', 'fitness', 'yoga', 'e-sport'],
            'messen': ['markt', 'messe', 'floh'],
            'kulinarik': ['festival', 'food', 'kochkurs', 'beer', 'vegan', 'kulinar'],
            'wissen': ['workshop', 'seminar', 'kurs'],
            'unique-underground': ['underground', 'pop-up', 'secret', 'alternative', 'guerilla'],
            'community-spontan': ['community', 'spontan', 'nachbarschaft', 'repair', 'skill'],
            'random-weird': ['weird', 'kurios', 'mystery', 'random', 'weltrekord', 'silent', 'cosplay']
          };
          
          // More lenient category matching in demo mode
          let matchesCategory = false;
          for (const category of filters.categories) {
            const allowedCategories = categoryMapping[category] || [category];
            if (allowedCategories.some(cat => 
              event.category.toLowerCase().includes(cat) ||
              event.title.toLowerCase().includes(cat) ||
              event.description?.toLowerCase().includes(cat)
            )) {
              matchesCategory = true;
              break;
            }
          }
          if (!matchesCategory) return false;
        }
        
        // More lenient time filtering in demo mode
        if (filters.timeRange && filters.timeRange !== 'thisWeek') {
          const eventDate = new Date(event.date);
          const now = new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 14); // Extended to 2 weeks in demo mode
          
          if (eventDate < today || eventDate > nextWeek) return false;
        }
        
        return true;
      });
    }

    // Apply search mode logic
    if (filters.searchMode === 'discover') {
      // Prioritize unique/underground events
      events = events.sort((a, b) => {
        const aIsUnique = a.category.toLowerCase().includes('underground') || 
                          a.category.toLowerCase().includes('pop-up') ||
                          a.title.toLowerCase().includes('secret') ||
                          a.title.toLowerCase().includes('alternative');
        const bIsUnique = b.category.toLowerCase().includes('underground') || 
                          b.category.toLowerCase().includes('pop-up') ||
                          b.title.toLowerCase().includes('secret') ||
                          b.title.toLowerCase().includes('alternative');
        
        if (aIsUnique && !bIsUnique) return -1;
        if (!aIsUnique && bIsUnique) return 1;
        return 0;
      });
    }

    console.log('✅ Filtered events result:', events.length, 'events passed filters');
    return events;
  }, [searchResults, filters, favoriteEvents]);

  // Update active session with results count
  useEffect(() => {
    if (activeSessionId) {
      setSessions(prev => 
        prev.map(session => 
          session.id === activeSessionId 
            ? { ...session, resultsCount: filteredEvents.length }
            : session
        )
      );
    }
  }, [filteredEvents.length, activeSessionId]);

  // Show settings screen if settings are open
  if (showSettings) {
    return <SettingsScreen onClose={() => setShowSettings(false)} />;
  }

  // Show start screen if not started searching yet
  if (showStartScreen) {
    return <AdvancedStartScreen 
      onStartSearch={handleStartSearch} 
      onSettingsClick={() => setShowSettings(true)}
      onShowResults={() => {
        setShowStartScreen(false);
        setViewMode('list');
      }}
    />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavigationHeader
        sessions={sessions}
        activeSessionId={activeSessionId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSessionSwitch={handleSessionSwitch}
        onNewSearch={handleNewSearch}
        onSettingsClick={() => setShowSettings(true)}
        onQuickFilter={handleQuickFilter}
        onAdvancedFilters={handleAdvancedFilters}
        showSearchMode={showSearchMode}
        onSearchModeToggle={handleSearchModeToggle}
        searchHistory={searchHistory}
        savedTemplates={savedTemplates}
        onLoadSearch={handleLoadSearch}
        onDeleteSearch={handleDeleteSearch}
        onApplyTemplate={handleApplyTemplate}
        onClearAllHistory={handleClearAllHistory}
        currentFilters={filters}
        onQuickFilterChange={handleQuickFilterChange}
        favoriteEvents={favoriteEvents}
      />
      
      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <AdvancedSearchDropdown
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setShowAdvancedFilters(false)}
            />
          </div>
        </div>
      )}

      {/* Search Mode Overlay */}
      {showSearchMode && (
        <div className="fixed inset-0 bg-background z-40 pt-32 md:pt-40">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <AdvancedSearchDropdown
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClose={() => setShowSearchMode(false)}
                fullscreen={true}
              />
            </div>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-6">
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              <>
                {false && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      ⚠️ <strong>Demo-Modus deaktiviert</strong> - Zeigt nur exakte Treffer. 
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-amber-800 underline ml-1"
                        onClick={() => setDemoMode(true)}
                      >
                        Demo-Modus aktivieren
                      </Button> für mehr Ergebnisse.
                    </p>
                  </div>
                )}
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    location={event.location}
                    exactAddress={event.exactAddress}
                    date={event.date}
                    time={event.time}
                    image={event.image}
                    category={event.category}
                    description={event.description}
                    price={event.price}
                    specialFeature={event.specialFeature}
                    source={event.source}
                    tickets={event.tickets}
                    isFavorite={isFavorite(event.id)}
                    onToggleFavorite={() => toggleFavorite(event.id)}
                  />
                ))}
              </>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Keine Events gefunden 😔</h3>
                  <p className="text-muted-foreground">
                    Für die gewählten Filter wurden keine passenden Events gefunden.
                  </p>
                </div>
                
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="text-sm space-y-2">
                    <p className="font-medium text-foreground">💡 Versuchen Sie:</p>
                    <ul className="text-left text-muted-foreground space-y-1">
                      <li>• Erweitern Sie den Suchradius</li>
                      <li>• Wählen Sie andere Kategorien</li>
                      <li>• Ändern Sie den Zeitraum</li>
                      <li>• Entfernen Sie spezielle Filter</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 justify-center pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDemoMode(true)}
                      className="text-xs"
                    >
                      🎯 Demo-Modus aktivieren
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleNewSearch}
                      className="text-xs"
                    >
                      🔄 Neue Suche
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <MapView 
            events={filteredEvents.map(event => ({
              ...event,
              isFavorite: isFavorite(event.id),
              onToggleFavorite: () => toggleFavorite(event.id)
            }))} 
          />
        )}
      </main>
    </div>
  );
}