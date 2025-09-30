import { useState } from 'react';
import { Search, Map, List, Menu, Settings, Plus, MapPin, Zap, Filter, Clock, X, Star, Trash2, RotateCcw, Bolt, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { SearchFilters } from './AdvancedSearchDropdown';

// Simplified Search Session for basic functionality
export interface SimpleSearchSession {
  id: string;
  location: string;
  resultsCount: number;
}

// Search History Entry for dropdown
export interface SearchHistoryEntry {
  id: string;
  location: string;
  radius: number;
  filters?: string[];
  timestamp: Date;
  resultsCount: number;
  isActive?: boolean;
}

// Saved Search Template
export interface SavedSearchTemplate {
  id: string;
  name: string;
  location: string;
  filters: Partial<SearchFilters>;
}

// Quick Filter Options
export interface QuickFilterState {
  time: string[];
  price: string[];
  distance: string[];
  special: string[];
  favorites: string[];
}

export interface QuickFilterOptions {
  time: { id: string; label: string; icon?: string }[];
  price: { id: string; label: string; icon?: string }[];
  distance: { id: string; label: string; icon?: string }[];
  special: { id: string; label: string; icon?: string }[];
  favorites: { id: string; label: string; icon?: string }[];
}

interface SimpleNavigationHeaderProps {
  sessions?: SimpleSearchSession[];
  activeSessionId?: string;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  onSessionSwitch?: (sessionId: string) => void;
  onNewSearch: () => void;
  onSettingsClick?: () => void;
  onQuickFilter?: (filters: Partial<SearchFilters>) => void;
  onAdvancedFilters?: () => void;
  showSearchMode?: boolean;
  onSearchModeToggle?: () => void;
  searchHistory?: SearchHistoryEntry[];
  savedTemplates?: SavedSearchTemplate[];
  onLoadSearch?: (searchId: string) => void;
  onDeleteSearch?: (searchId: string) => void;
  onApplyTemplate?: (template: SavedSearchTemplate) => void;
  onClearAllHistory?: () => void;
  currentFilters?: SearchFilters;
  onQuickFilterChange?: (quickFilters: QuickFilterState) => void;
  favoriteEvents?: Set<string>;
  demoMode?: boolean;
  onDemoModeToggle?: () => void;
}

export function SimpleNavigationHeader({
  sessions = [],
  activeSessionId = '',
  viewMode = 'list',
  onViewModeChange,
  onSessionSwitch,
  onNewSearch,
  onSettingsClick,
  onQuickFilter,
  onAdvancedFilters,
  showSearchMode = false,
  onSearchModeToggle,
  searchHistory = [],
  savedTemplates = [],
  onLoadSearch,
  onDeleteSearch,
  onApplyTemplate,
  onClearAllHistory,
  currentFilters,
  onQuickFilterChange,
  favoriteEvents = new Set(),
  demoMode = true,
  onDemoModeToggle
}: SimpleNavigationHeaderProps) {
  const [isMobile, setIsMobile] = useState(true); // Default to mobile for simplicity
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isQuickFilterOpen, setIsQuickFilterOpen] = useState(false);
  const [quickFilters, setQuickFilters] = useState<QuickFilterState>({
    time: [],
    price: [],
    distance: [],
    special: [],
    favorites: []
  });

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Mock search history with more realistic data
  const mockSearchHistory: SearchHistoryEntry[] = searchHistory.length > 0 ? searchHistory : [
    {
      id: 'search-1',
      location: 'Bern',
      radius: 30,
      filters: ['Alle Kategorien'],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      resultsCount: 12
    },
    {
      id: 'search-2', 
      location: 'Basel',
      radius: 15,
      filters: ['Familie'],
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      resultsCount: 8
    }
  ];

  // Mock saved templates
  const mockSavedTemplates: SavedSearchTemplate[] = savedTemplates.length > 0 ? savedTemplates : [
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
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'vor wenigen Minuten';
    if (diffInHours === 1) return 'vor 1 Std';
    if (diffInHours < 24) return `vor ${diffInHours} Std`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'vor 1 Tag';
    return `vor ${diffInDays} Tagen`;
  };

  const handleLoadSearch = (searchId: string) => {
    setIsHistoryOpen(false);
    onLoadSearch?.(searchId);
  };

  const handleDeleteSearch = (searchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSearch?.(searchId);
  };

  const handleApplyTemplate = (template: SavedSearchTemplate) => {
    setIsHistoryOpen(false);
    onApplyTemplate?.(template);
  };

  const handleClearAll = () => {
    onClearAllHistory?.();
    setIsHistoryOpen(false);
  };

  // Quick Filter Options
  const quickFilterOptions: QuickFilterOptions = {
    time: [
      { id: 'now', label: 'Jetzt' },
      { id: 'today', label: 'Heute' },
      { id: 'tomorrow', label: 'Morgen' },
      { id: 'thisWeek', label: 'Diese Woche' },
      { id: 'weekend', label: 'Wochenende' }
    ],
    price: [
      { id: 'free', label: '🆓 Gratis', icon: '🆓' },
      { id: 'under20', label: '< 20.-' },
      { id: 'under50', label: '< 50.-' },
      { id: 'any', label: 'Egal' }
    ],
    distance: [
      { id: 'walking', label: 'Zu Fuss' },
      { id: 'under5', label: '< 5km' },
      { id: 'under10', label: '< 10km' },
      { id: 'any', label: 'Egal' }
    ],
    special: [
      { id: 'indoor', label: '🏠 Indoor', icon: '🏠' },
      { id: 'accessible', label: '♿ Barrierefrei', icon: '♿' },
      { id: 'family', label: '👶 Mit Kindern', icon: '👶' },
      { id: 'tickets', label: '🎫 Tickets', icon: '🎫' }
    ],
    favorites: [
      { id: 'showFavorites', label: '💖 Favoriten anzeigen', icon: '💖' }
    ]
  };

  const getActiveFilterCount = () => {
    return quickFilters.time.length + quickFilters.price.length + 
           quickFilters.distance.length + quickFilters.special.length + 
           quickFilters.favorites.length;
  };

  const toggleQuickFilter = (category: keyof QuickFilterState, filterId: string) => {
    setQuickFilters(prev => {
      const newFilters = { ...prev };
      const currentFilters = newFilters[category];
      
      if (currentFilters.includes(filterId)) {
        newFilters[category] = currentFilters.filter(id => id !== filterId);
      } else {
        newFilters[category] = [...currentFilters, filterId];
      }
      
      return newFilters;
    });
  };

  const resetQuickFilters = () => {
    setQuickFilters({
      time: [],
      price: [],
      distance: [],
      special: [],
      favorites: []
    });
    
    // Also reset the actual filters to defaults
    const resetFilters: Partial<SearchFilters> = {
      timeRange: 'thisWeek',
      budget: {
        min: currentFilters?.budget?.min || 0,
        max: currentFilters?.budget?.max || 200,
        onlyFree: false
      },
      radius: 25,
      specialTags: [],
      showFavoritesOnly: false
    };
    
    onQuickFilter?.(resetFilters);
  };

  const applyQuickFilters = () => {
    // Convert quick filters to SearchFilters format - ALWAYS set all properties explicitly
    const appliedFilters: Partial<SearchFilters> = {};
    
    // Time filters - reset to default if none selected
    if (quickFilters.time.includes('now')) {
      appliedFilters.timeRange = 'now';
    } else if (quickFilters.time.includes('today')) {
      appliedFilters.timeRange = 'today';
    } else if (quickFilters.time.includes('tomorrow')) {
      appliedFilters.timeRange = 'tomorrow';
    } else if (quickFilters.time.includes('thisWeek')) {
      appliedFilters.timeRange = 'thisWeek';
    } else if (quickFilters.time.includes('weekend')) {
      appliedFilters.timeRange = 'thisWeekend';
    } else {
      // Reset to default if no time filter selected
      appliedFilters.timeRange = 'thisWeek';
    }
    
    // Price filters - always reset budget object
    const resetBudget = {
      min: currentFilters?.budget?.min || 0,
      max: currentFilters?.budget?.max || 200,
      onlyFree: false
    };
    
    if (quickFilters.price.includes('free')) {
      appliedFilters.budget = { ...resetBudget, onlyFree: true };
    } else if (quickFilters.price.includes('under20')) {
      appliedFilters.budget = { ...resetBudget, max: 20 };
    } else if (quickFilters.price.includes('under50')) {
      appliedFilters.budget = { ...resetBudget, max: 50 };
    } else {
      // Reset to original budget if no price filter selected
      appliedFilters.budget = resetBudget;
    }
    
    // Distance filters - reset to default if none selected
    if (quickFilters.distance.includes('walking')) {
      appliedFilters.radius = 2;
    } else if (quickFilters.distance.includes('under5')) {
      appliedFilters.radius = 5;
    } else if (quickFilters.distance.includes('under10')) {
      appliedFilters.radius = 10;
    } else {
      // Reset to default radius if no distance filter selected
      appliedFilters.radius = currentFilters?.radius || 25;
    }
    
    // Special filters - always set specialTags array
    const specialTags = [];
    if (quickFilters.special.includes('indoor')) specialTags.push('indoor');
    if (quickFilters.special.includes('accessible')) specialTags.push('barrierefrei');
    if (quickFilters.special.includes('family')) specialTags.push('familien');
    if (quickFilters.special.includes('tickets')) specialTags.push('tickets');
    
    // Always set specialTags, even if empty
    appliedFilters.specialTags = specialTags;
    
    // Favorites filter - always set explicitly
    appliedFilters.showFavoritesOnly = quickFilters.favorites.includes('showFavorites');
    
    onQuickFilterChange?.(quickFilters);
    onQuickFilter?.(appliedFilters);
    setIsQuickFilterOpen(false);
  };

  // Mobile view (simplified)
  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
      {/* Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-600">What's UP</span>
            <span className="text-sm text-muted-foreground font-medium">
              Find unique events!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={demoMode ? "default" : "outline"}
              size="sm"
              onClick={onDemoModeToggle}
              className="text-xs h-7 px-2"
              title={demoMode ? "Demo-Modus aktiv - Zeigt immer Ergebnisse" : "Demo-Modus deaktiviert"}
            >
              {demoMode ? "🎯 DEMO" : "DEMO"}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onSettingsClick}
              className="h-9 w-9"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search History Dropdown */}
      {activeSession && (
        <div className="px-4 pb-3">
          <DropdownMenu open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium flex-1">{activeSession.location}</span>
                <Badge variant="secondary" className="text-xs">
                  {activeSession.resultsCount} Events
                </Badge>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="start">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Suchverlauf</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsHistoryOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Active Search */}
              <div className="p-3">
                <div className="text-sm font-medium text-muted-foreground mb-2">AKTIVE SUCHE</div>
                <div className="border rounded-lg p-3 bg-accent/30">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{activeSession.location}</span>
                    <Badge variant="secondary" className="text-xs ml-auto">✓</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>├─ Radius: 25km</div>
                    <div>├─ Filter: Jazz, Diese Woche</div>
                    <div>└─ Gefunden: {activeSession.resultsCount} Events</div>
                  </div>
                </div>
              </div>

              {/* Previous Searches */}
              {mockSearchHistory.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-3">
                    <div className="text-sm font-medium text-muted-foreground mb-2">LETZTE SUCHEN</div>
                    <div className="space-y-2">
                      {mockSearchHistory.map((search) => (
                        <div
                          key={search.id}
                          className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => handleLoadSearch(search.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{search.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(search.timestamp)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => handleDeleteSearch(search.id, e)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>├─ {search.radius}km, {search.filters?.join(', ') || 'Alle Kategorien'}</div>
                            <div>└─ {search.resultsCount} Events</div>
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Laden
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Saved Templates */}
              {mockSavedTemplates.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-3">
                    <div className="text-sm font-medium text-muted-foreground mb-2">GESPEICHERTE VORLAGEN</div>
                    <div className="space-y-2">
                      {mockSavedTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => handleApplyTemplate(template)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{template.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            📍 {template.location}
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              Anwenden
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Footer Actions */}
              <DropdownMenuSeparator />
              <div className="p-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={onNewSearch}
                >
                  <Search className="w-3 h-3 mr-1" />
                  Neue Suche
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={handleClearAll}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Alle löschen
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Mobile Action Bar */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4 mr-1" />
            Liste
          </Button>
          
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('map')}
          >
            <Map className="w-4 h-4 mr-1" />
            Karte
          </Button>
          
          <DropdownMenu open={isQuickFilterOpen} onOpenChange={setIsQuickFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filter
                {getActiveFilterCount() > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <Bolt className="w-4 h-4" />
                  <span className="font-medium">Schnellfilter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {getActiveFilterCount()} Filter aktiv
                  </span>
                  {getActiveFilterCount() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetQuickFilters}
                      className="h-6 text-xs"
                    >
                      Löschen
                    </Button>
                  )}
                </div>
              </div>

              {/* WANN? */}
              <div className="p-3">
                <div className="text-sm font-medium mb-2">WANN?</div>
                <div className="flex flex-wrap gap-2">
                  {quickFilterOptions.time.map((option) => (
                    <Button
                      key={option.id}
                      variant={quickFilters.time.includes(option.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleQuickFilter('time', option.id)}
                      className="text-xs h-7"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* WIE TEUER? */}
              <div className="p-3">
                <div className="text-sm font-medium mb-2">WIE TEUER?</div>
                <div className="flex flex-wrap gap-2">
                  {quickFilterOptions.price.map((option) => (
                    <Button
                      key={option.id}
                      variant={quickFilters.price.includes(option.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleQuickFilter('price', option.id)}
                      className="text-xs h-7"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* WIE WEIT? */}
              <div className="p-3">
                <div className="text-sm font-medium mb-2">WIE WEIT?</div>
                <div className="flex flex-wrap gap-2">
                  {quickFilterOptions.distance.map((option) => (
                    <Button
                      key={option.id}
                      variant={quickFilters.distance.includes(option.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleQuickFilter('distance', option.id)}
                      className="text-xs h-7"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* SPEZIAL */}
              <div className="p-3">
                <div className="text-sm font-medium mb-2">SPEZIAL</div>
                <div className="flex flex-wrap gap-2">
                  {quickFilterOptions.special.map((option) => (
                    <Button
                      key={option.id}
                      variant={quickFilters.special.includes(option.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleQuickFilter('special', option.id)}
                      className="text-xs h-7 relative group"
                    >
                      {option.label}
                      {quickFilters.special.includes(option.id) && (
                        <X 
                          className="w-3 h-3 ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQuickFilter('special', option.id);
                          }}
                        />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* FAVORITEN */}
              <div className="p-3">
                <div className="text-sm font-medium mb-2">FAVORITEN</div>
                <div className="flex flex-wrap gap-2">
                  {quickFilterOptions.favorites.map((option) => (
                    <Button
                      key={option.id}
                      variant={quickFilters.favorites.includes(option.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleQuickFilter('favorites', option.id)}
                      className="text-xs h-7"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                {favoriteEvents.size === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Keine Favoriten vorhanden. Markiere Events mit ❤️ um sie hier zu finden.
                  </p>
                )}
                {favoriteEvents.size > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {favoriteEvents.size} Favorit{favoriteEvents.size !== 1 ? 'en' : ''} gespeichert
                  </p>
                )}
              </div>

              {/* Footer Actions */}
              <DropdownMenuSeparator />
              <div className="p-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={resetQuickFilters}
                >
                  Zurücksetzen
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={applyQuickFilters}
                >
                  ✓ Anwenden
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNewSearch}
          >
            <Search className="w-4 h-4 mr-1" />
            Neu
          </Button>
        </div>

        {/* Search Mode Toggle */}

      </div>
    </div>
  );
}