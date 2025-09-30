import { useState } from 'react';
import { Search, Navigation, Settings } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { SearchFilters } from './AdvancedSearchDropdown';

interface SimpleStartScreenProps {
  onStartSearch: (filters: SearchFilters) => void;
}

export function SimpleStartScreen({ onStartSearch }: SimpleStartScreenProps) {
  const [location, setLocation] = useState('Zürich, Schweiz');
  const [keywords, setKeywords] = useState('');

  const handleStartSearch = () => {
    const filters: SearchFilters = {
      location,
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
      keywords,
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
    };
    
    onStartSearch(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-600">WhatsUP</h1>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          {/* STANDORT */}
          <div className="space-y-3">
            <label className="block font-medium">📍 STANDORT</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="Stadt oder Adresse eingeben..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 flex-shrink-0"
                title="Aktuellen Standort verwenden"
              >
                <Navigation className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* SUCHBEGRIFFE */}
          <div className="space-y-3">
            <label className="block font-medium">🔍 SUCHBEGRIFFE</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="z.B. Jazz, Outdoor, Konzert..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <div className="pt-6">
            <Button 
              onClick={handleStartSearch}
              size="lg"
              className="w-full h-14 text-lg"
            >
              🔍 EVENTS SUCHEN
            </Button>
          </div>

          {/* Loading message */}
          <div className="text-center text-sm text-muted-foreground">
            <p>💡 Vereinfachte Version zum Testen</p>
          </div>
        </div>
      </div>
    </div>
  );
}