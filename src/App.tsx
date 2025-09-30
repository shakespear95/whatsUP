import React, { useState } from 'react';
import Header from './components/Header/Header';
import SearchCard from './components/SearchCard/SearchCard';
import ViewNavigation, { ViewType } from './components/ViewNavigation/ViewNavigation';
import EventListView from './components/EventListView/EventListView';
import MapView from './components/MapView/MapView';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import SettingsModal from './components/SettingsModal/SettingsModal';
import { searchService } from './services/api';
import { Event, SearchFormData } from './types';
import './styles/globals.css';
import './components/EventCard/EventCard.css';

function App() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSearchClick = () => {
    // This is no longer needed as we have direct search interface
  };

  const handleSearch = async (searchData: SearchFormData) => {
    try {
      setSearchLoading(true);
      const response = await searchService.searchEvents(searchData);

      if (response.success && response.data) {
        setSearchResults(response.data.events);
        setShowResults(true);
        setCurrentView('list'); // Switch to list view after search
      } else {
        alert(response.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleShowPreviousResults = () => {
    setShowResults(true);
    setCurrentView('list');
  };

  const handleViewChange = (view: ViewType) => {
    if (view === 'filter') {
      setShowFilter(true);
    } else if (view === 'new') {
      // Handle new event creation
      alert('Neue Event-Erstellung kommt bald!');
    } else {
      setCurrentView(view);
    }
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // Apply filters to search results
  };

  const renderMainContent = () => {
    if (!showResults) {
      return (
        <main className="main-content">
          <SearchCard
            onSearch={handleSearch}
            loading={searchLoading}
            onShowPreviousResults={handleShowPreviousResults}
            hasPreviousResults={searchResults.length > 0}
          />
        </main>
      );
    }

    return (
      <main className="results-content">
        <div className="results-container">
          <ViewNavigation
            activeView={currentView}
            onViewChange={handleViewChange}
          />

          {currentView === 'list' && (
            <EventListView events={searchResults} loading={searchLoading} />
          )}

          {currentView === 'map' && (
            <MapView events={searchResults} loading={searchLoading} />
          )}
        </div>
      </main>
    );
  };

  return (
    <div className="App">
      <Header
        onSearchClick={handleSearchClick}
        onSettingsClick={() => setShowSettings(true)}
      />
      {renderMainContent()}

      <FilterSidebar
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onFiltersChange={handleFilterChange}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
