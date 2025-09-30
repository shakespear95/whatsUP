import { useState } from 'react';
import { Search, MapPin, Navigation, Settings, List, Map, Menu } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { AdvancedSearchDropdown, SearchFilters } from './AdvancedSearchDropdown';

interface StartScreenProps {
  onStartSearch: (filters: SearchFilters) => void;
}

export function StartScreen({ onStartSearch }: StartScreenProps) {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    useCurrentLocation: false,
    radius: 25,
    eventType: 'any',
    dateFrom: undefined,
    dateTo: undefined,
    keywords: ''
  });

  const handleLocationDetection = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation wird von diesem Browser nicht unterstützt');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFilters(prev => ({ 
          ...prev,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          useCurrentLocation: true 
        }));
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Standort konnte nicht ermittelt werden');
      }
    );
  };

  const handleStartSearch = () => {
    onStartSearch(filters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-red-600">WhatsUP</h1>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <Input
              placeholder="Events suchen..."
              value={filters.keywords}
              onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
              className="pl-12 pr-12 h-14 text-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              title="Erweiterte Suche"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Location Selection */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Choose location..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value, useCurrentLocation: false }))}
                className="pl-12 h-12"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLocationDetection}
              className="h-12 w-12 flex-shrink-0"
              title="Aktuellen Standort verwenden"
            >
              <Navigation className="w-5 h-5" />
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center">
            <div className="flex rounded-lg border overflow-hidden">
              <Button
                variant="default"
                size="sm"
                className="rounded-none border-0"
              >
                <List className="w-4 h-4 mr-2" />
                Liste
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none border-0 border-l"
              >
                <Map className="w-4 h-4 mr-2" />
                Karte
              </Button>
            </div>
          </div>

          {/* Advanced Search Dropdown */}
          {showAdvancedSearch && (
            <div className="relative">
              <AdvancedSearchDropdown
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowAdvancedSearch(false)}
              />
            </div>
          )}
        </div>

        {/* Empty State Content */}
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          
          <h2 className="text-xl font-medium mb-4">
            Search for events near you
          </h2>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Discover exciting events, concerts, workshops and much more. 
            Choose your location and start searching for the perfect event for you.
          </p>

          <Button 
            onClick={handleStartSearch}
            size="lg"
            className="h-12 px-8"
          >
            Suche starten
          </Button>
        </div>
      </div>
    </div>
  );
}