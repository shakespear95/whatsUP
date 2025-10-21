import { useState } from 'react';
import { Search, MapPin, Navigation, Settings, ChevronDown, ChevronRight, X, Plus, Calendar, Sparkles, Target, Send, List, Lock, LogIn, Mail } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { SearchFilters } from './AdvancedSearchDropdown';
import { useAuth } from '../hooks/useAuth';
import { EmailAuthModal } from './EmailAuthModal';

interface AdvancedStartScreenProps {
  onStartSearch: (filters: SearchFilters) => void;
  onSettingsClick?: () => void;
  onShowResults?: () => void;
  demoMode?: boolean;
  onDemoModeToggle?: () => void;
}

// Category data structure - ERWEITERT mit neuen UNIQUE Kategorien
const categoryData = {
  'konzerte': {
    label: 'Concerts & Party',
    color: '#8B5CF6',
    subcategories: ['pop-rock', 'elektro-dance', 'jazz-blues', 'klassik-oper', 'hip-hop-rap', 'schlager-volksmusik', 'metal-punk', 'world-music', 'cover-bands', 'party-clubbing', 'festivals']
  },
  'buehne': {
    label: 'Stage & Theater',
    color: '#EF4444',
    subcategories: ['theater', 'musical', 'comedy-cabaret', 'dance-ballet', 'variety-circus', 'opera', 'literature-reading', 'poetry-slam']
  },
  'kunst': {
    label: 'Art & Museums',
    color: '#3B82F6',
    subcategories: ['exhibition', 'museum', 'gallery', 'vernissage', 'handicrafts', 'photography', 'film-cinema', 'architecture']
  },
  'familie': {
    label: 'Family & Kids',
    color: '#10B981',
    subcategories: ['children-theater', 'kids-circus', 'kids-workshops', 'fairy-tales', 'arts-crafts', 'playground-events', 'family-concerts', 'zoo-animals']
  },
  'sport': {
    label: 'Sports & Recreation',
    color: '#F59E0B',
    subcategories: ['football', 'ice-hockey', 'basketball', 'tennis', 'running', 'cycling', 'hiking-trekking', 'winter-sports', 'water-sports', 'fitness-yoga', 'dance-classes', 'e-sports']
  },
  'messen': {
    label: 'Trade Shows & Markets',
    color: '#6366F1',
    subcategories: ['flohmärkte', 'weihnachtsmärkte', 'wochenmärkte', 'fachmessen', 'publikumsmessen', 'job-messen', 'handwerkermärkte', 'food-markets']
  },
  'kulinarik': {
    label: 'Food & Culinary',
    color: '#EC4899',
    subcategories: ['food-festivals', 'wine-dine', 'brunch-frühstück', 'kochkurse', 'degustationen', 'street-food', 'bier-craftbeer', 'gin-cocktails', 'veggie-vegan']
  },
  'wissen': {
    label: 'Knowledge & Business',
    color: '#14B8A6',
    subcategories: ['vorträge-talks', 'workshops-kurse', 'seminare', 'networking', 'konferenzen', 'weiterbildung', 'startup-events', 'tech-meetups']
  },
  'specials': {
    label: 'Special Events',
    color: '#F97316',
    subcategories: ['stadtführungen', 'advents-events', 'silvester', 'valentinstag', 'public-viewing', 'open-air', 'charity-events', 'pride-events']
  },
  // NEUE EINZIGARTIGE KATEGORIEN
  'unique-underground': {
    label: 'Unique & Underground',
    color: '#1F2937',
    subcategories: ['pop-up-events', 'secret-locations', 'underground-alternative', 'guerilla-events', 'flash-mobs', 'immersive-experiences', 'experimental-art', 'diy-maker-events', 'subkultur', 'lost-places-tours']
  },
  'community-spontan': {
    label: 'Community & Spontaneous',
    color: '#059669',
    subcategories: ['nachbarschaftstreffen', 'spontane-gatherings', 'skill-sharing', 'tauschbörsen', 'repair-cafés', 'community-gardens', 'jam-sessions', 'open-mic-nights', 'stammtische', 'meet-greet']
  },
  'random-weird': {
    label: 'Random & Weird',
    color: '#7C2D12',
    subcategories: ['kurioses-skurriles', 'weltrekordversuche', 'cosplay-larp', 'mystery-events', 'escape-games', 'silent-disco', 'midnight-shopping', 'vollmond-events', 'urban-exploring', 'retro-nostalgie']
  }
};

// ERWEITERTE Quick-Filter laut Spezifikation
const quickFiltersData = [
  // Barrierefreiheit (vollständig)
  { id: 'wheelchair', label: '♿ Rollstuhlgerecht', category: 'accessibility' },
  { id: 'barrierefrei', label: '👁️ Barrierefrei', category: 'accessibility' },
  { id: 'assistenzhunde', label: '🦮 Assistenzhunde OK', category: 'accessibility' },
  { id: 'hoergeschaedigt', label: '🔊 Hörgeschädigt-geeignet', category: 'accessibility' },
  { id: 'sehbehindert', label: '👁️ Sehbehindert-geeignet', category: 'accessibility' },
  { id: 'leichte-sprache', label: '📖 Leichte Sprache', category: 'accessibility' },
  
  // Altersgruppen (vollständig)
  { id: 'babies', label: '👶 0-3 Jahre', category: 'age' },
  { id: 'kleinkinder', label: '🧒 4-6 Jahre', category: 'age' },
  { id: 'kinder', label: '👦 7-9 Jahre', category: 'age' },
  { id: 'jugend', label: '👧 10-12 Jahre', category: 'age' },
  { id: 'teens', label: '🧑 13-16 Jahre', category: 'age' },
  { id: 'adults-only', label: '🔞 Nur Erwachsene 18+', category: 'age' },
  
  // Location-Features (vollständig)
  { id: 'indoor', label: '🏠 Indoor', category: 'location' },
  { id: 'outdoor', label: '☀️ Outdoor', category: 'location' },
  { id: 'wetterunabhängig', label: '🌧️ Wetterunabhängig', category: 'location' },
  { id: 'parking', label: '🅿️ Parkplätze', category: 'features' },
  { id: 'oev', label: '🚇 ÖV-Nähe', category: 'features' },
  { id: 'aufzug', label: '♿ Aufzug vorhanden', category: 'features' },
  
  // Event-Eigenschaften (vollst��ndig)
  { id: 'gratis', label: '🆓 Nur Gratis', category: 'price' },
  { id: 'vorverkauf', label: '🎟️ Vorverkauf', category: 'price' },
  { id: 'fotografieren', label: '📸 Fotografieren erlaubt', category: 'features' },
  { id: 'hunde', label: '🐕 Hunde erlaubt', category: 'features' },
  { id: 'gruppen', label: '👥 Gruppen-geeignet', category: 'special' },
  { id: 'romantisch', label: '💑 Romantisch', category: 'special' },
  
  // Verpflegung (vollständig)
  { id: 'bar', label: '🍺 Mit Bar', category: 'catering' },
  { id: 'restaurant', label: '🍽️ Mit Restaurant', category: 'catering' },
  { id: 'cafe', label: '☕ Café vorhanden', category: 'catering' },
  { id: 'vegetarisch', label: '🥗 Vegetarisch/Vegan', category: 'catering' },
  { id: 'street-food', label: '🍔 Street Food', category: 'catering' },
  
  // Special Interest (vollständig)
  { id: 'geheim-underground', label: '🔐 Geheim/Underground', category: 'special' },
  { id: 'last-minute', label: '⚡ Last-Minute', category: 'special' },
  { id: 'mystery-event', label: '🎲 Mystery Event', category: 'special' },
  { id: 'after-hours', label: '🌙 After Hours', category: 'special' },
  { id: 'pop-up', label: '🎪 Pop-up', category: 'special' },
  { id: 'trending', label: '🔥 Trending', category: 'special' },
  { id: 'exklusiv', label: '�� Exklusiv', category: 'special' },
  { id: 'premiere', label: '🆕 Premiere', category: 'special' },
  { id: 'instagrammable', label: '📸 Instagrammable', category: 'special' }
];

export function AdvancedStartScreen({ onStartSearch, onSettingsClick, onShowResults, demoMode = true, onDemoModeToggle }: AdvancedStartScreenProps) {
  const { user } = useAuth();
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: 'Zürich, Schweiz',
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

  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showFilterSelection, setShowFilterSelection] = useState(false);
  const [showExtendedFilters, setShowExtendedFilters] = useState(false);
  const [showCategoryRequest, setShowCategoryRequest] = useState(false);
  const [showFilterRequest, setShowFilterRequest] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Category request form state
  const [categoryRequest, setCategoryRequest] = useState({
    name: '',
    description: '',
    reason: '',
    examples: '',
    email: ''
  });

  // Filter request form state
  const [filterRequest, setFilterRequest] = useState({
    name: '',
    category: '',
    description: '',
    reason: '',
    examples: '',
    email: ''
  });

  const handleLocationDetection = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get actual place name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            {
              headers: {
                'User-Agent': 'WhatsUP-Event-Finder/1.0',
              },
            }
          );

          const data = await response.json();

          // Get city, town, or village name
          const placeName = data.address?.city ||
                           data.address?.town ||
                           data.address?.village ||
                           data.address?.county ||
                           data.address?.state ||
                           `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          const country = data.address?.country || '';
          const locationName = country ? `${placeName}, ${country}` : placeName;

          console.log('📍 Detected location:', locationName);

          setFilters(prev => ({
            ...prev,
            location: locationName,
            useCurrentLocation: true
          }));
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          // Fallback to coordinates if reverse geocoding fails
          setFilters(prev => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            useCurrentLocation: true
          }));
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not determine location');
      }
    );
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleCategoryRequest = () => {
    // In einer echten App würde hier ein API-Call gemacht
    console.log('Kategorie-Antrag:', categoryRequest);
    
    // Erfolgsmeldung anzeigen
    alert(`Vielen Dank! Ihr Antrag für die Kategorie "${categoryRequest.name}" wurde eingereicht. Wir werden ihn prüfen und uns bei Ihnen melden.`);
    
    // Form zurücksetzen
    setCategoryRequest({
      name: '',
      description: '',
      reason: '',
      examples: '',
      email: ''
    });
    
    setShowCategoryRequest(false);
  };

  const handleFilterRequest = () => {
    // In einer echten App würde hier ein API-Call gemacht
    console.log('Filter-Antrag:', filterRequest);
    
    // Erfolgsmeldung anzeigen
    alert(`Vielen Dank! Ihr Antrag für den Filter "${filterRequest.name}" wurde eingereicht. Wir werden ihn prüfen und uns bei Ihnen melden.`);
    
    // Form zurücksetzen
    setFilterRequest({
      name: '',
      category: '',
      description: '',
      reason: '',
      examples: '',
      email: ''
    });
    
    setShowFilterRequest(false);
  };

  const toggleQuickFilter = (filterId: string) => {
    setFilters(prev => {
      const isSelected = prev.quickFilters.includes(filterId);
      return {
        ...prev,
        quickFilters: isSelected
          ? prev.quickFilters.filter(id => id !== filterId)
          : [...prev.quickFilters, filterId]
      };
    });
  };

  const handleStartSearch = () => {
    // Check authentication first
    if (!user) {
      alert('🔒 Please sign in to search for events.\n\nThis protects our costs and enables personalized results for you!');
      return;
    }

    // Validation
    if (!filters.location.trim()) {
      alert('Please choose a location');
      return;
    }

    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
      alert('End date must be after start date');
      return;
    }

    onStartSearch(filters);
  };

  const getBudgetLabel = () => {
    if (filters.budget.onlyFree) return 'Gratis';
    if (filters.budget.max >= 200) return `Bis CHF ${filters.budget.max}+`;
    return `Bis CHF ${filters.budget.max}`;
  };

  const getSelectedCategoriesText = () => {
    const count = filters.categories.length;
    if (count === 0) return 'Alle Kategorien';
    if (count === 1) {
      const categoryKey = filters.categories[0] as keyof typeof categoryData;
      return categoryData[categoryKey]?.label || 'Kategorie';
    }
    return `${count} ausgewählt`;
  };

  const getSearchModeDescription = () => {
    switch (filters.searchMode) {
      case 'discover':
        return 'Priorisiert einzigartige & experimentelle Events';
      default:
        return 'Relevanz-basierte Suche';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-blue-600">What's UP</span>
              <span className="text-sm text-muted-foreground font-medium">
                Find unique events!
              </span>
            </div>
            <div className="flex items-center gap-2">
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="space-y-6">
          


          {/* SEARCH MODE */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="font-medium whitespace-nowrap w-8 md:w-32">
                <span className="md:hidden">🎲</span>
                <span className="hidden md:inline">🎲 MODE</span>
              </label>
              <div className="flex-1 flex gap-2">
                {(['standard', 'discover'] as const).map((mode) => {
                  const modeInfo = mode === 'discover'
                    ? { icon: <Sparkles className="w-4 h-4" />, label: 'Discover' }
                    : { icon: <Target className="w-4 h-4" />, label: 'Standard' };
                  
                  return (
                    <Button
                      key={mode}
                      variant={filters.searchMode === mode ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ searchMode: mode })}
                      className="flex-1 h-12 md:h-10"
                    >
                      {modeInfo.icon}
                      <span className="ml-1">{modeInfo.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            {filters.searchMode !== 'standard' && (
              <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                {getSearchModeDescription()}
              </div>
            )}
          </div>

          {/* 1. LOCATION */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="font-medium whitespace-nowrap w-8 md:w-32">
                <span className="md:hidden">📍</span>
                <span className="hidden md:inline">📍 LOCATION</span>
              </label>
              <div className="flex-1 flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Enter city or address..."
                    value={filters.location}
                    onChange={(e) => updateFilters({ location: e.target.value, useCurrentLocation: false })}
                    className="h-12 md:h-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLocationDetection}
                  className="h-12 w-12 md:h-10 md:w-10 flex-shrink-0"
                  title="Use current location"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 2. RADIUS */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="font-medium whitespace-nowrap w-8 md:w-32">
                <span className="md:hidden">🎯</span>
                <span className="hidden md:inline">🎯 RADIUS</span>
              </label>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-sm">{filters.radius} km</span>
                <Slider
                  value={[filters.radius]}
                  onValueChange={(value) => updateFilters({ radius: value[0] })}
                  max={100}
                  min={1}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 3. CATEGORIES - Hidden in Discover Mode */}
          {filters.searchMode !== 'discover' && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="font-medium whitespace-nowrap w-8 md:w-32">
                <span className="md:hidden">📂</span>
                <span className="hidden md:inline">📂 CATEGORIES</span>
              </label>
              <div className="flex-1">
                <Dialog open={showCategoriesModal} onOpenChange={setShowCategoriesModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-12 md:h-10">
                      <span>
                        {filters.categories.length > 0
                          ? `${filters.categories.length} Categories`
                          : "Choose categories"
                        }
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Choose Categories</DialogTitle>
                      <DialogDescription>
                        Select the event categories you're interested in
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Categories List */}
                      <div className="space-y-2">
                        {Object.entries(categoryData).map(([categoryId, category]) => (
                          <div key={categoryId} className="border rounded-lg p-3">
                            {/* Main Category */}
                            <div className="flex items-center gap-3 mb-2">
                              <Checkbox
                                checked={filters.categories.includes(categoryId)}
                                onCheckedChange={() => {
                                  const isSelected = filters.categories.includes(categoryId);
                                  const newCategories = isSelected
                                    ? filters.categories.filter(id => id !== categoryId)
                                    : [...filters.categories, categoryId];
                                  updateFilters({ categories: newCategories });
                                }}
                              />
                              <span className="font-medium" style={{ color: category.color }}>
                                {category.label}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 w-6 p-0 ml-auto"
                                onClick={() => {
                                  const isExpanded = expandedCategories.has(categoryId);
                                  const newExpanded = new Set(expandedCategories);
                                  if (isExpanded) {
                                    newExpanded.delete(categoryId);
                                  } else {
                                    newExpanded.add(categoryId);
                                  }
                                  setExpandedCategories(newExpanded);
                                }}
                              >
                                {expandedCategories.has(categoryId) ? 
                                  <ChevronDown className="w-4 h-4" /> : 
                                  <ChevronRight className="w-4 h-4" />
                                }
                              </Button>
                            </div>
                            
                            {/* Subcategories */}
                            {expandedCategories.has(categoryId) && (
                              <div className="pl-6 pt-2 border-t border-border/30">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                  {category.subcategories.map((subcategory: string) => (
                                    <div key={subcategory} className="flex items-center space-x-2 p-1 hover:bg-muted/30 rounded text-sm">
                                      <Checkbox
                                        id={`subcategory-${subcategory}`}
                                        checked={filters.subcategories.includes(subcategory)}
                                        onCheckedChange={(checked) => {
                                          const isSelected = filters.subcategories.includes(subcategory);
                                          const newSubcategories = isSelected
                                            ? filters.subcategories.filter(id => id !== subcategory)
                                            : [...filters.subcategories, subcategory];
                                          updateFilters({ subcategories: newSubcategories });
                                        }}
                                      />
                                      <label 
                                        htmlFor={`subcategory-${subcategory}`}
                                        className="text-sm cursor-pointer flex-1 text-muted-foreground hover:text-foreground"
                                      >
                                        {subcategory.replace('-', ' ')}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Request new category section */}
                      <div className="border-t pt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowCategoryRequest(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Neue Kategorie beantragen
                        </Button>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="ghost" onClick={() => updateFilters({ categories: [], subcategories: [] })}>
                          Zurücksetzen
                        </Button>
                        <Button onClick={() => setShowCategoriesModal(false)}>
                          Übernehmen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          )}

          {/* 4. TIME PERIOD */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="font-medium whitespace-nowrap w-8 md:w-32">
                <span className="md:hidden">📅</span>
                <span className="hidden md:inline">📅 TIME PERIOD</span>
              </label>
              <div className="flex-1">
                <Select 
                  value={filters.timeRange} 
                  onValueChange={(value) => updateFilters({ timeRange: value })}
                >
                  <SelectTrigger className="w-full justify-between h-12 md:h-10">
                    <SelectValue placeholder="Choose time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="thisWeekend">This Weekend</SelectItem>
                    <SelectItem value="nextWeek">Next Week</SelectItem>
                    <SelectItem value="nextMonth">Next Month</SelectItem>
                    <SelectItem value="custom">Choose Custom Time Period</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {filters.timeRange === 'custom' && (
              <div className="bg-card border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From:</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {filters.dateFrom ? (
                            new Date(filters.dateFrom).toLocaleDateString('en-US')
                          ) : (
                            <span>Choose Start Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateFrom}
                          onSelect={(date) => updateFilters({ dateFrom: date })}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">To:</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {filters.dateTo ? (
                            new Date(filters.dateTo).toLocaleDateString('en-US')
                          ) : (
                            <span>Choose End Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateTo}
                          onSelect={(date) => updateFilters({ dateTo: date })}
                          disabled={(date) => date < new Date() || (filters.dateFrom && date < filters.dateFrom)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Quick Date Shortcuts */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const nextWeek = new Date(today);
                      nextWeek.setDate(today.getDate() + 7);
                      updateFilters({ 
                        dateFrom: today, 
                        dateTo: nextWeek 
                      });
                    }}
                  >
                    Nächste 7 Tage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const nextMonth = new Date(today);
                      nextMonth.setMonth(today.getMonth() + 1);
                      updateFilters({ 
                        dateFrom: today, 
                        dateTo: nextMonth 
                      });
                    }}
                  >
                    Nächsten Monat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateFilters({ 
                        dateFrom: undefined, 
                        dateTo: undefined 
                      });
                    }}
                  >
                    Zurücksetzen
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 5. BUDGET */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="font-medium whitespace-nowrap w-8 md:w-32">
                <span className="md:hidden">💰</span>
                <span className="hidden md:inline">💰 BUDGET</span>
              </label>
              <div className="flex-1">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full justify-between h-12 md:h-10"
                >
                  <span>
                    {filters.budget.onlyFree 
                      ? "Gratis" 
                      : filters.budget.max !== 200 
                        ? `CHF ${filters.budget.max}` 
                        : "Choose budget"
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
            
            {showAdvancedFilters && (
              <div className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={filters.budget.onlyFree}
                    onCheckedChange={(checked) => 
                      updateFilters({ 
                        budget: { 
                          ...filters.budget, 
                          onlyFree: !!checked,
                          max: checked ? 0 : 200 
                        } 
                      })
                    }
                  />
                  <span className="text-sm">Nur Gratis-Events</span>
                </div>
                {!filters.budget.onlyFree && (
                  <div className="space-y-2">
                    <Slider
                      value={[filters.budget.max]}
                      onValueChange={(value) => 
                        updateFilters({ 
                          budget: { ...filters.budget, max: value[0] } 
                        })
                      }
                      max={200}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>CHF 0</span>
                      <span>CHF 200+</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>



          {/* 7. FILTER */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="font-medium whitespace-nowrap w-8 md:w-32">
                <span className="md:hidden">⚡</span>
                <span className="hidden md:inline">⚡ FILTER</span>
              </label>
              <div className="flex-1">
                <Dialog open={showFilterSelection} onOpenChange={setShowFilterSelection}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between h-12 md:h-10"
                    >
                      <span>
                        {filters.quickFilters.length > 0 
                          ? `${filters.quickFilters.length} Filter aktiv` 
                          : "Choose filters"
                        }
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Filter auswählen</DialogTitle>
                      <DialogDescription>
                        Wählen Sie die gewünschten Filter für Ihre Eventsuche aus.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* NORMALE FILTER */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Normale Filter</h3>
                        
                        {/* Event-Eigenschaften */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">💰 Event-Eigenschaften</h4>
                          <div className="flex flex-wrap gap-2">
                            {quickFiltersData.filter(f => f.category === 'price' || 
                              ['vorverkauf', 'fotografieren', 'hunde', 'gruppen', 'romantisch'].includes(f.id)
                            ).map((filter) => (
                              <Button
                                key={filter.id}
                                variant={filters.quickFilters.includes(filter.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleQuickFilter(filter.id)}
                                className="text-xs"
                              >
                                {filter.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Location-Features */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">📍 Location-Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {quickFiltersData.filter(f => f.category === 'location' || 
                              ['parking', 'oev', 'aufzug'].includes(f.id)
                            ).map((filter) => (
                              <Button
                                key={filter.id}
                                variant={filters.quickFilters.includes(filter.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleQuickFilter(filter.id)}
                                className="text-xs"
                              >
                                {filter.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Verpflegung */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">🍽️ Verpflegung</h4>
                          <div className="flex flex-wrap gap-2">
                            {quickFiltersData.filter(f => f.category === 'catering').map((filter) => (
                              <Button
                                key={filter.id}
                                variant={filters.quickFilters.includes(filter.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleQuickFilter(filter.id)}
                                className="text-xs"
                              >
                                {filter.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Special Interest */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">✨ Special Interest</h4>
                          <div className="flex flex-wrap gap-2">
                            {quickFiltersData.filter(f => f.category === 'special').map((filter) => (
                              <Button
                                key={filter.id}
                                variant={filters.quickFilters.includes(filter.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleQuickFilter(filter.id)}
                                className="text-xs"
                              >
                                {filter.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ERWEITERTE FILTER - COLLAPSIBLE */}
                      <div className="pt-4 border-t">
                        <Button 
                          variant="ghost" 
                          onClick={() => setShowExtendedFilters(!showExtendedFilters)}
                          className="w-full justify-between p-0 h-auto font-medium"
                        >
                          <span>Erweiterte Filter</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${showExtendedFilters ? 'rotate-180' : ''}`} />
                        </Button>
                        
                        {showExtendedFilters && (
                          <div className="space-y-4 mt-4">
                            {/* Barrierefreiheit */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">♿ Barrierefreiheit</h4>
                              <div className="flex flex-wrap gap-2">
                                {quickFiltersData.filter(f => f.category === 'accessibility').map((filter) => (
                                  <Button
                                    key={filter.id}
                                    variant={filters.quickFilters.includes(filter.id) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleQuickFilter(filter.id)}
                                    className="text-xs"
                                  >
                                    {filter.label}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Altersgruppen */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">👶 Altersgruppen</h4>
                              <div className="flex flex-wrap gap-2">
                                {quickFiltersData.filter(f => f.category === 'age').map((filter) => (
                                  <Button
                                    key={filter.id}
                                    variant={filters.quickFilters.includes(filter.id) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleQuickFilter(filter.id)}
                                    className="text-xs"
                                  >
                                    {filter.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Request new filter section */}
                      <div className="border-t pt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowFilterRequest(true)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Neuen Filter beantragen
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between gap-4 pt-4">
                        <Button 
                          variant="ghost"
                          onClick={() => updateFilters({ quickFilters: [] })}
                        >
                          Alle zurücksetzen
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => setShowFilterSelection(false)}
                          >
                            Abbrechen
                          </Button>
                          <Button 
                            onClick={() => setShowFilterSelection(false)}
                          >
                            Übernehmen ({filters.quickFilters.length})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* AUTH BANNER - Show if not logged in */}
          {!user && (
            <div className="pt-4 mb-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    🔒 Sign in required
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                    Sign in to discover 20+ AI-powered events! You'll receive a code via email or can click the Magic Link.
                  </p>
                  <Button
                    onClick={() => setShowEmailAuth(true)}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-purple-300 shadow-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Sign in with Email
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* START SEARCH BUTTON */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleStartSearch}
              disabled={!user}
              className={`w-full h-12 font-medium ${
                user
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {user ? (
                <>🔍 Start Event Search</>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Sign in to Search
                </>
              )}
            </Button>
            
            {/* BISHERIGE ERGEBNISSE BUTTON */}
            <Button
              onClick={() => onShowResults && onShowResults()}
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900"
            >
              <List className="w-4 h-4 mr-2" />
              Bisherige Ergebnisse anzeigen
            </Button>
          </div>

        </div>
      </div>

      {/* Category Request Dialog */}
      <Dialog open={showCategoryRequest} onOpenChange={setShowCategoryRequest}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neue Kategorie beantragen</DialogTitle>
            <DialogDescription>
              Schlagen Sie eine neue Event-Kategorie für WhatsUP vor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Kategorie-Name *</label>
              <Input
                placeholder="z.B. Wellness & Entspannung"
                value={categoryRequest.name}
                onChange={(e) => setCategoryRequest(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Beschreibung *</label>
              <Textarea
                placeholder="Beschreiben Sie die vorgeschlagene Kategorie..."
                value={categoryRequest.description}
                onChange={(e) => setCategoryRequest(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Reason *</label>
              <Textarea
                placeholder="Warum braucht WhatsUP diese Kategorie?"
                value={categoryRequest.reason}
                onChange={(e) => setCategoryRequest(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Event-Beispiele</label>
              <Textarea
                placeholder="Name 2-3 specific event examples for this category..."
                value={categoryRequest.examples}
                onChange={(e) => setCategoryRequest(prev => ({ ...prev, examples: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ihre E-Mail *</label>
              <Input
                type="email"
                placeholder="ihre.email@beispiel.ch"
                value={categoryRequest.email}
                onChange={(e) => setCategoryRequest(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Für Rückfragen zur Kategorie-Anfrage
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCategoryRequest(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleCategoryRequest}
              disabled={!categoryRequest.name || !categoryRequest.description || !categoryRequest.reason || !categoryRequest.email}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-1" />
              Antrag senden
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Request Dialog */}
      <Dialog open={showFilterRequest} onOpenChange={setShowFilterRequest}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neuen Filter beantragen</DialogTitle>
            <DialogDescription>
              Schlagen Sie einen neuen Filter für WhatsUP vor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Filter-Name *</label>
              <Input
                placeholder="z.B. Live-Übersetzung verfügbar"
                value={filterRequest.name}
                onChange={(e) => setFilterRequest(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Filter-Kategorie *</label>
              <select
                value={filterRequest.category}
                onChange={(e) => setFilterRequest(prev => ({ ...prev, category: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">Kategorie wählen...</option>
                <option value="accessibility">🔧 Barrierefreiheit</option>
                <option value="age">👥 Altersgruppen</option>
                <option value="location">📍 Location-Features</option>
                <option value="catering">🍽️ Verpflegung</option>
                <option value="special">✨ Special Interest</option>
                <option value="new">📂 Neue Kategorie</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Beschreibung *</label>
              <Textarea
                placeholder="Beschreiben Sie den vorgeschlagenen Filter..."
                value={filterRequest.description}
                onChange={(e) => setFilterRequest(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Reason *</label>
              <Textarea
                placeholder="Warum braucht WhatsUP diesen Filter?"
                value={filterRequest.reason}
                onChange={(e) => setFilterRequest(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Anwendungs-Beispiele</label>
              <Textarea
                placeholder="Name 2-3 specific events where this filter would be helpful..."
                value={filterRequest.examples}
                onChange={(e) => setFilterRequest(prev => ({ ...prev, examples: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ihre E-Mail *</label>
              <Input
                type="email"
                placeholder="ihre.email@beispiel.ch"
                value={filterRequest.email}
                onChange={(e) => setFilterRequest(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Für Rückfragen zum Filter-Antrag
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowFilterRequest(false)}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleFilterRequest}
              disabled={!filterRequest.name || !filterRequest.category || !filterRequest.description || !filterRequest.reason || !filterRequest.email}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-1" />
              Antrag senden
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Auth Modal */}
      <EmailAuthModal
        open={showEmailAuth}
        onClose={() => setShowEmailAuth(false)}
        onSuccess={() => {
          setShowEmailAuth(false);
          // User is now logged in, they can search
        }}
      />
    </div>
  );
}