import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation, Calendar, Filter, ChevronDown, X, Plus, Minus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export interface SearchFilters {
  location: string;
  useCurrentLocation: boolean;
  radius: number;
  categories: string[];
  subcategories: string[];
  timeRange: string;
  dateFrom?: Date;
  dateTo?: Date;
  budget: {
    min: number;
    max: number;
    onlyFree: boolean;
  };
  keywords: string;
  quickFilters: string[];
  specialTags: string[];
  searchMode: 'standard' | 'discover';
  eventFrequency: string[];
  advancedFilters: {
    accessibility: string[];
    ageGroups: string[];
    features: string[];
    catering: string[];
  };
  showFavoritesOnly?: boolean;
}

export interface FilterTemplate {
  id: string;
  name: string;
  icon: string;
  filters: SearchFilters;
  createdAt: Date;
}

interface AdvancedSearchDropdownProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
  fullscreen?: boolean;
}

// Erweiterte Kategorie-Struktur mit hierarchischen Unterkategorien
const eventCategories = [
  {
    id: 'konzerte',
    label: 'Konzerte & Musik',
    icon: '🎵',
    subcategories: [
      { id: 'rock-pop', label: 'Rock & Pop' },
      { id: 'jazz-blues', label: 'Jazz & Blues' },
      { id: 'klassik', label: 'Klassische Musik' },
      { id: 'electronic', label: 'Electronic & Techno' },
      { id: 'indie-alternative', label: 'Indie & Alternative' },
      { id: 'reggae-ska', label: 'Reggae & Ska' },
      { id: 'world-music', label: 'World Music' },
      { id: 'singer-songwriter', label: 'Singer-Songwriter' },
      { id: 'metal-punk', label: 'Metal & Punk' },
      { id: 'acoustic', label: 'Acoustic Sessions' },
      { id: 'live-music', label: 'Live Music Sessions' },
      { id: 'open-mic', label: 'Open Mic Nights' }
    ]
  },
  {
    id: 'buehne',
    label: 'Bühne & Theater',
    icon: '🎭',
    subcategories: [
      { id: 'theater-drama', label: 'Theater & Drama' },
      { id: 'musical', label: 'Musical' },
      { id: 'kabarett', label: 'Kabarett & Comedy' },
      { id: 'improv', label: 'Improvisationstheater' },
      { id: 'monolog', label: 'Monologe' },
      { id: 'experimental-theater', label: 'Experimentelles Theater' },
      { id: 'street-theater', label: 'Straßentheater' },
      { id: 'puppet-theater', label: 'Puppentheater' },
      { id: 'dance-theater', label: 'Tanztheater' },
      { id: 'open-air-theater', label: 'Open-Air Theater' },
      { id: 'shakespeare', label: 'Shakespeare' },
      { id: 'contemporary-theater', label: 'Zeitgenössisches Theater' }
    ]
  },
  {
    id: 'kunst',
    label: 'Kunst & Ausstellungen',
    icon: '🎨',
    subcategories: [
      { id: 'malerei', label: 'Malerei' },
      { id: 'skulptur', label: 'Skulptur' },
      { id: 'fotografie', label: 'Fotografie' },
      { id: 'digital-art', label: 'Digital Art' },
      { id: 'installation', label: 'Installationen' },
      { id: 'performance-art', label: 'Performance Art' },
      { id: 'street-art', label: 'Street Art' },
      { id: 'design', label: 'Design' },
      { id: 'architektur', label: 'Architektur' },
      { id: 'handwerk', label: 'Kunsthandwerk' },
      { id: 'galerie-opening', label: 'Galerie-Eröffnungen' },
      { id: 'art-walk', label: 'Art Walks' },
      { id: 'museum-night', label: 'Museumsnächte' },
      { id: 'contemporary-art', label: 'Zeitgenössische Kunst' }
    ]
  },
  {
    id: 'familie',
    label: 'Familie & Kinder',
    icon: '👨‍👩‍👧‍👦',
    subcategories: [
      { id: 'kindertheater', label: 'Kindertheater' },
      { id: 'puppenspiel', label: 'Puppenspiel' },
      { id: 'familienkonzert', label: 'Familienkonzerte' },
      { id: 'maerchen', label: 'Märchen' },
      { id: 'zirkus', label: 'Zirkus' },
      { id: 'basteln', label: 'Basteln & Kreativ' },
      { id: 'spielplatz', label: 'Spielplatz-Events' },
      { id: 'kindermuseum', label: 'Kindermuseum' },
      { id: 'familienwanderung', label: 'Familienwanderungen' },
      { id: 'kinderfest', label: 'Kinderfeste' },
      { id: 'baby-events', label: 'Baby & Kleinkind' },
      { id: 'eltern-kind', label: 'Eltern-Kind-Aktivitäten' }
    ]
  },
  {
    id: 'sport',
    label: 'Sport & Fitness',
    icon: '⚽',
    subcategories: [
      { id: 'fussball', label: 'Fußball' },
      { id: 'basketball', label: 'Basketball' },
      { id: 'tennis', label: 'Tennis' },
      { id: 'schwimmen', label: 'Schwimmen' },
      { id: 'laufen', label: 'Laufen' },
      { id: 'yoga', label: 'Yoga' },
      { id: 'fitness', label: 'Fitness' },
      { id: 'kampfsport', label: 'Kampfsport' },
      { id: 'klettern', label: 'Klettern' },
      { id: 'radfahren', label: 'Radfahren' },
      { id: 'wintersport', label: 'Wintersport' },
      { id: 'wassersport', label: 'Wassersport' },
      { id: 'outdoor-sport', label: 'Outdoor Sport' },
      { id: 'e-sport', label: 'E-Sport' },
      { id: 'turniere', label: 'Turniere' }
    ]
  },
  {
    id: 'messen',
    label: 'Messen & Märkte',
    icon: '🏪',
    subcategories: [
      { id: 'flohmarkt', label: 'Flohmärkte' },
      { id: 'kunstmarkt', label: 'Kunstmärkte' },
      { id: 'bauernmarkt', label: 'Bauernmärkte' },
      { id: 'weihnachtsmarkt', label: 'Weihnachtsmärkte' },
      { id: 'vintage-markt', label: 'Vintage-Märkte' },
      { id: 'handwerkermarkt', label: 'Handwerkermärkte' },
      { id: 'designmarkt', label: 'Designmärkte' },
      { id: 'büchermarkt', label: 'Büchermärkte' },
      { id: 'antikmarkt', label: 'Antikmärkte' },
      { id: 'messe-business', label: 'Business Messen' },
      { id: 'tech-messe', label: 'Tech-Messen' },
      { id: 'auto-messe', label: 'Auto-Messen' }
    ]
  },
  {
    id: 'kulinarik',
    label: 'Kulinarik & Festivals',
    icon: '🍽️',
    subcategories: [
      { id: 'food-festival', label: 'Food Festivals' },
      { id: 'street-food', label: 'Street Food' },
      { id: 'wine-tasting', label: 'Wine Tasting' },
      { id: 'beer-festival', label: 'Bierfeste' },
      { id: 'kochkurs', label: 'Kochkurse' },
      { id: 'baking', label: 'Backkurse' },
      { id: 'vegan-food', label: 'Vegane Küche' },
      { id: 'fine-dining', label: 'Fine Dining' },
      { id: 'popup-restaurant', label: 'Pop-up Restaurants' },
      { id: 'farmers-dinner', label: 'Bauernhof-Dinner' },
      { id: 'food-truck', label: 'Food Trucks' },
      { id: 'cocktail-workshop', label: 'Cocktail Workshops' },
      { id: 'chocolate-tasting', label: 'Schokoladen-Verkostung' }
    ]
  },
  {
    id: 'wissen',
    label: 'Wissen & Workshops',
    icon: '📚',
    subcategories: [
      { id: 'vortrag', label: 'Vorträge' },
      { id: 'seminar', label: 'Seminare' },
      { id: 'workshop-kreativ', label: 'Kreativ-Workshops' },
      { id: 'tech-workshop', label: 'Tech-Workshops' },
      { id: 'business-seminar', label: 'Business-Seminare' },
      { id: 'marketing', label: 'Marketing' },
      { id: 'fotografie-kurs', label: 'Fotografie-Kurse' },
      { id: 'sprach-kurs', label: 'Sprachkurse' },
      { id: 'computer-kurs', label: 'Computer-Kurse' },
      { id: 'startup', label: 'Startup-Events' },
      { id: 'wissenschaft', label: 'Wissenschaft' },
      { id: 'philosophie', label: 'Philosophie' },
      { id: 'diskussion', label: 'Diskussionsrunden' }
    ]
  },
  {
    id: 'unique-underground',
    label: 'Unique & Underground',
    icon: '🎭',
    subcategories: [
      { id: 'secret-location', label: 'Secret Locations' },
      { id: 'underground-party', label: 'Underground Partys' },
      { id: 'pop-up-events', label: 'Pop-up Events' },
      { id: 'guerilla-art', label: 'Guerilla Art' },
      { id: 'flash-mob', label: 'Flash Mobs' },
      { id: 'alternative-scene', label: 'Alternative Szene' },
      { id: 'experimental', label: 'Experimentell' },
      { id: 'immersive', label: 'Immersive Experiences' },
      { id: 'mystery-events', label: 'Mystery Events' },
      { id: 'hidden-gems', label: 'Hidden Gems' },
      { id: 'insider-tipps', label: 'Insider-Tipps' },
      { id: 'exclusive', label: 'Exklusive Events' }
    ]
  },
  {
    id: 'community-spontan',
    label: 'Community & Spontan',
    icon: '🤝',
    subcategories: [
      { id: 'nachbarschaft', label: 'Nachbarschafts-Events' },
      { id: 'community-dinner', label: 'Community Dinner' },
      { id: 'skill-sharing', label: 'Skill Sharing' },
      { id: 'repair-cafe', label: 'Repair Cafés' },
      { id: 'tauschmarkt', label: 'Tauschmärkte' },
      { id: 'meetup', label: 'Meetups' },
      { id: 'stammtisch', label: 'Stammtische' },
      { id: 'spontan-treffen', label: 'Spontan-Treffen' },
      { id: 'social-impact', label: 'Social Impact' },
      { id: 'volunteer', label: 'Volunteer-Events' },
      { id: 'networking', label: 'Networking' },
      { id: 'study-groups', label: 'Lerngruppen' }
    ]
  },
  {
    id: 'random-weird',
    label: 'Random & Weird',
    icon: '🎲',
    subcategories: [
      { id: 'weltrekord', label: 'Weltrekord-Versuche' },
      { id: 'kurios', label: 'Kuriose Events' },
      { id: 'silent-disco', label: 'Silent Disco' },
      { id: 'cosplay', label: 'Cosplay' },
      { id: 'anime-manga', label: 'Anime & Manga' },
      { id: 'gaming', label: 'Gaming-Events' },
      { id: 'science-fiction', label: 'Science Fiction' },
      { id: 'mystery', label: 'Mystery & Rätseln' },
      { id: 'weird-science', label: 'Weird Science' },
      { id: 'unusual', label: 'Ungewöhnliche Events' },
      { id: 'bizarre', label: 'Bizarre Veranstaltungen' },
      { id: 'experimental-weird', label: 'Experimentell & Weird' }
    ]
  }
];

export function AdvancedSearchDropdown({ filters, onFiltersChange, onClose, fullscreen = false }: AdvancedSearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      updateFilters({ categories: [...filters.categories, categoryId] });
    } else {
      updateFilters({ 
        categories: filters.categories.filter(id => id !== categoryId),
        subcategories: filters.subcategories.filter(subId => {
          const category = eventCategories.find(cat => cat.id === categoryId);
          return !category?.subcategories.some(sub => sub.id === subId);
        })
      });
    }
  };

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
    if (checked) {
      updateFilters({ subcategories: [...filters.subcategories, subcategoryId] });
    } else {
      updateFilters({ 
        subcategories: filters.subcategories.filter(id => id !== subcategoryId)
      });
    }
  };

  const isCategorySelected = (categoryId: string) => {
    return filters.categories.includes(categoryId);
  };

  const isSubcategorySelected = (subcategoryId: string) => {
    return filters.subcategories.includes(subcategoryId);
  };

  const getSelectedCategoriesCount = () => {
    return filters.categories.length + filters.subcategories.length;
  };

  const handleLocationDetection = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation wird von diesem Browser nicht unterstützt');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, you would reverse geocode these coordinates
        const { latitude, longitude } = position.coords;
        updateFilters({ 
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          useCurrentLocation: true 
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Standort konnte nicht ermittelt werden');
      }
    );
  };



  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.categories.length > 0 || filters.subcategories.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.keywords) count++;
    if (filters.radius !== 25) count++;
    return count;
  };

  // Close dropdown when clicking outside (only for non-fullscreen mode)
  useEffect(() => {
    if (!fullscreen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [onClose, fullscreen]);

  const containerClass = fullscreen 
    ? "w-full bg-background rounded-lg p-6 max-w-4xl mx-auto"
    : "absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 p-6";

  return (
    <div 
      ref={dropdownRef}
      className={containerClass}
    >
      {/* Header for fullscreen mode */}
      {fullscreen && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold">Erweiterte Suche</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Section */}
        <div className="space-y-3">
          <label className="block font-medium">Standort</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Stadt oder Adresse eingeben..."
                value={filters.location}
                onChange={(e) => updateFilters({ location: e.target.value, useCurrentLocation: false })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLocationDetection}
              title="Aktuellen Standort verwenden"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search Radius */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Suchradius: {filters.radius} km
            </label>
            <Slider
              value={[filters.radius]}
              onValueChange={(value) => updateFilters({ radius: value[0] })}
              max={100}
              min={1}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>100 km</span>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block font-medium">Zeitraum</label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? filters.dateFrom.toLocaleDateString('de-DE') : 'Von'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => updateFilters({ dateFrom: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateTo ? filters.dateTo.toLocaleDateString('de-DE') : 'Bis'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => updateFilters({ dateTo: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Categories and Subcategories */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block font-medium">Kategorien & Unterkategorien</label>
          {getSelectedCategoriesCount() > 0 && (
            <Badge variant="secondary">
              {getSelectedCategoriesCount()} ausgewählt
            </Badge>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto border rounded-lg bg-background">
          <div className="p-2 space-y-1">
            {eventCategories.map((category) => (
              <Collapsible
                key={category.id}
                open={expandedCategories.has(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <div className="border-b border-border/50 last:border-b-0">
                  <div className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={isCategorySelected(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <label 
                      htmlFor={`category-${category.id}`}
                      className="flex items-center space-x-2 flex-1 cursor-pointer"
                    >
                      <span>{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                    </label>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleCategory(category.id);
                        }}
                      >
                        {expandedCategories.has(category.id) ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <Plus className="w-4 h-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="pl-6 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="flex items-center space-x-2 p-1 hover:bg-muted/30 rounded text-sm">
                          <Checkbox
                            id={`subcategory-${subcategory.id}`}
                            checked={isSubcategorySelected(subcategory.id)}
                            onCheckedChange={(checked) => handleSubcategoryChange(subcategory.id, checked as boolean)}
                          />
                          <label 
                            htmlFor={`subcategory-${subcategory.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {subcategory.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </div>
        
        {/* Quick Actions for Categories */}
        <div className="flex gap-2 text-xs">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              updateFilters({ categories: [], subcategories: [] });
              setExpandedCategories(new Set());
            }}
          >
            Alle abwählen
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpandedCategories(new Set(eventCategories.map(cat => cat.id)))}
          >
            Alle erweitern
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpandedCategories(new Set())}
          >
            Alle zuklappen
          </Button>
        </div>
      </div>

      {/* Keywords */}
      <div className="mt-6 space-y-2">
        <label className="block font-medium">Stichwörter</label>
        <Input
          placeholder="z.B. Jazz, Outdoor, Familie..."
          value={filters.keywords}
          onChange={(e) => updateFilters({ keywords: e.target.value })}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div className="flex gap-2">
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary">
              {getActiveFilterCount()} Filter aktiv
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              onFiltersChange({
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
            }}
          >
            Zurücksetzen
          </Button>
          <Button onClick={onClose}>
            Suchen
          </Button>
        </div>
      </div>
    </div>
  );
}