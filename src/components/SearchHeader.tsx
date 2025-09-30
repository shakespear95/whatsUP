import { useState } from "react";
import { Search, Map, List, Menu, Filter, ChevronDown, Settings } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AdvancedSearchDropdown, SearchFilters } from "./AdvancedSearchDropdown";

interface SearchHeaderProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  resultsCount: number;
  onSettingsClick?: () => void;
}

export function SearchHeader({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange, 
  resultsCount,
  onSettingsClick
}: SearchHeaderProps) {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.categories.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.keywords) count++;
    if (filters.radius !== 25) count++;
    if (filters.quickFilters.length > 0) count++;
    if (filters.budget.onlyFree || filters.budget.max !== 200) count++;
    return count;
  };

  const getSearchSummary = () => {
    const parts = [];
    if (filters.keywords) parts.push(filters.keywords);
    if (filters.location) parts.push(`in ${filters.location}`);
    if (filters.categories.length > 0) {
      if (filters.categories.length === 1) {
        parts.push(filters.categories[0]);
      } else {
        parts.push(`${filters.categories.length} Kategorien`);
      }
    }
    if (filters.timeRange && filters.timeRange !== 'all') {
      const timeRangeLabels: { [key: string]: string } = {
        'today': 'Heute',
        'tomorrow': 'Morgen',
        'thisWeek': 'Diese Woche',
        'thisWeekend': 'Wochenende',
        'nextWeek': 'Nächste Woche',
        'nextMonth': 'Nächsten Monat'
      };
      parts.push(timeRangeLabels[filters.timeRange] || 'Zeitraum');
    }
    if (filters.dateFrom || filters.dateTo) {
      if (filters.dateFrom && filters.dateTo) {
        parts.push(`${filters.dateFrom.toLocaleDateString('de-DE')} - ${filters.dateTo.toLocaleDateString('de-DE')}`);
      } else if (filters.dateFrom) {
        parts.push(`ab ${filters.dateFrom.toLocaleDateString('de-DE')}`);
      } else if (filters.dateTo) {
        parts.push(`bis ${filters.dateTo.toLocaleDateString('de-DE')}`);
      }
    }
    if (filters.budget.onlyFree) {
      parts.push('Gratis');
    } else if (filters.budget.max !== 200) {
      parts.push(`bis CHF ${filters.budget.max}`);
    }
    if (filters.quickFilters.length > 0) {
      parts.push(`${filters.quickFilters.length} Filter`);
    }
    return parts.join(' • ') || 'Alle Events';
  };

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-red-600">WhatsUP</h1>
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
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Advanced Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              placeholder="Events suchen..."
              value={getSearchSummary()}
              onClick={() => setShowAdvancedSearch(true)}
              readOnly
              className="pl-10 pr-20 h-11 cursor-pointer"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="h-7 px-2"
              >
                <Filter className="w-4 h-4 mr-1" />
                <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {/* Advanced Search Dropdown */}
            {showAdvancedSearch && (
              <AdvancedSearchDropdown
                filters={filters}
                onFiltersChange={onFiltersChange}
                onClose={() => setShowAdvancedSearch(false)}
              />
            )}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:block">
              {resultsCount} Ergebnisse
            </span>
            <div className="flex rounded-lg border overflow-hidden">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-0"
              >
                <List className="w-4 h-4 mr-1" />
                Liste
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('map')}
                className="rounded-none border-0 border-l"
              >
                <Map className="w-4 h-4 mr-1" />
                Karte
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Results Count */}
        <div className="md:hidden mt-2">
          <span className="text-sm text-muted-foreground">
            {resultsCount} Ergebnisse
          </span>
        </div>
      </div>
    </div>
  );
}