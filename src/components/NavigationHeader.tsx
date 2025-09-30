import { useState, useEffect } from 'react';
import { Search, Map, List, Menu, Filter, ChevronDown, Settings, Plus, X, Zap, MoreHorizontal, MapPin, History, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { SearchFilters } from './AdvancedSearchDropdown';

// Search Session Management
export interface SearchSession {
  id: string;
  location: string;
  filters: SearchFilters;
  resultsCount: number;
  lastUpdated: Date;
  cached: boolean;
}

interface NavigationHeaderProps {
  sessions: SearchSession[];
  activeSessionId: string;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  onSessionSwitch: (sessionId: string) => void;
  onNewSearch: () => void;
  onSettingsClick?: () => void;
  onQuickFilter: (filters: Partial<SearchFilters>) => void;
  onAdvancedFilters: () => void;
}

export function NavigationHeader({
  sessions = [],
  activeSessionId = '',
  viewMode = 'list',
  onViewModeChange,
  onSessionSwitch,
  onNewSearch,
  onSettingsClick,
  onQuickFilter,
  onAdvancedFilters
}: NavigationHeaderProps) {
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };
    
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const activeSession = sessions?.find(s => s.id === activeSessionId);

  const getSessionSummary = (session: SearchSession) => {
    const parts = [];
    if (session.filters.radius !== 25) parts.push(`${session.filters.radius}km`);
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
    return parts.join(' • ') || 'Alle Events';
  };

  const QuickFilterPopup = () => (
    <Dialog open={showQuickFilters} onOpenChange={setShowQuickFilters}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Schnellfilter
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2">Zeit:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ timeRange: 'today' });
                  setShowQuickFilters(false);
                }}
              >
                Jetzt
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ timeRange: 'today' });
                  setShowQuickFilters(false);
                }}
              >
                Heute
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ timeRange: 'tomorrow' });
                  setShowQuickFilters(false);
                }}
              >
                Morgen
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ timeRange: 'thisWeek' });
                  setShowQuickFilters(false);
                }}
              >
                Woche
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2">Preis:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ budget: { ...activeSession?.filters.budget || { min: 0, max: 200, onlyFree: false }, onlyFree: true } });
                  setShowQuickFilters(false);
                }}
              >
                Gratis
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ budget: { min: 0, max: 20, onlyFree: false } });
                  setShowQuickFilters(false);
                }}
              >
                <20.-
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ budget: { min: 0, max: 50, onlyFree: false } });
                  setShowQuickFilters(false);
                }}
              >
                <50.-
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ budget: { min: 0, max: 200, onlyFree: false } });
                  setShowQuickFilters(false);
                }}
              >
                Alle
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2">Distanz:</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ radius: 2 });
                  setShowQuickFilters(false);
                }}
              >
                <2km
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ radius: 5 });
                  setShowQuickFilters(false);
                }}
              >
                <5km
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ radius: 10 });
                  setShowQuickFilters(false);
                }}
              >
                <10km
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onQuickFilter({ radius: 50 });
                  setShowQuickFilters(false);
                }}
              >
                Alle
              </Button>
            </div>
          </div>

          <Button onClick={() => setShowQuickFilters(false)} className="w-full">
            Anwenden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Mobile Navigation (< 768px)
  if (isMobile) {
    return (
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
        {/* Header */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-600">WhatsUP</h1>
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

        {/* Active Search Display */}
        <div className="px-4 pb-3">
          <Popover open={showSessionsDropdown} onOpenChange={setShowSessionsDropdown}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {activeSession?.location || 'Standort'} ▼
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {activeSession?.resultsCount || 0}
                  </Badge>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Aktuelle Suchen</h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowSessionsDropdown(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        session.id === activeSessionId 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        onSessionSwitch(session.id);
                        setShowSessionsDropdown(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{session.location}</span>
                          {session.id === activeSessionId && (
                            <Badge variant="default" className="text-xs">✓</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {getSessionSummary(session)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.resultsCount} Events
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-3" />
                <Button 
                  onClick={() => {
                    onNewSearch();
                    setShowSessionsDropdown(false);
                  }} 
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Neue Suche starten
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Mobile Action Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="flex-1"
            >
              <List className="w-4 h-4 mr-1" />
              Liste
            </Button>
            
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('map')}
              className="flex-1"
            >
              <Map className="w-4 h-4 mr-1" />
              Karte
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNewSearch}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-1" />
              Neue
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickFilters(true)}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-1" />
              Quick
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onAdvancedFilters}
              className="flex-1"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>

        <QuickFilterPopup />
      </div>
    );
  }

  // Desktop Navigation (> 1024px)
  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
      {/* Main Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-red-600">WhatsUP</h1>
              <nav className="hidden lg:flex items-center gap-4">
                <Button variant="ghost" size="sm">Suchen</Button>
                <Button variant="ghost" size="sm">Entdecken</Button>
                <Button variant="ghost" size="sm">Events</Button>
                <Button variant="ghost" size="sm">Hilfe</Button>
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Profil
                <ChevronDown className="w-4 h-4 ml-2" />
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
      </div>

      {/* Search Tabs */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">AKTIVE SUCHEN:</span>
            <div className="flex items-center gap-2">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={session.id === activeSessionId ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSessionSwitch(session.id)}
                  className="h-8"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{session.location}</span>
                    <Badge variant="secondary" className="text-xs">
                      {session.resultsCount}
                    </Badge>
                  </div>
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={onNewSearch}
                className="h-8"
              >
                <Plus className="w-3 h-3 mr-1" />
                Neu
              </Button>
            </div>
          </div>
        </div>

        {/* Active Session Info & Controls */}
        {activeSession && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm">
                <strong>{activeSession.resultsCount} Events</strong> in {activeSession.location}
              </span>
              <span className="text-sm text-muted-foreground">
                {getSessionSummary(activeSession)}
              </span>
              <Button variant="ghost" size="sm" className="h-7">
                Bearbeiten
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Sortieren:</span>
                <Button variant="outline" size="sm" className="h-8">
                  Relevanz
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Filter:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={onAdvancedFilters}
                >
                  3 aktiv
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => setShowQuickFilters(true)}
              >
                <Zap className="w-3 h-3 mr-1" />
                Quick
              </Button>
              
              <div className="flex rounded-lg border overflow-hidden">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="rounded-none border-0 h-8"
                >
                  <List className="w-4 h-4 mr-1" />
                  Liste
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('map')}
                  className="rounded-none border-0 border-l h-8"
                >
                  <Map className="w-4 h-4 mr-1" />
                  Karte
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none border-0 border-l h-8"
                >
                  Timeline
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <QuickFilterPopup />
    </div>
  );
}