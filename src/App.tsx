import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import SearchModal from './components/SearchModal/SearchModal';
import EventCard from './components/EventCard/EventCard';
import { searchService } from './services/api';
import { Event, SearchFormData } from './types';
import './styles/globals.css';
import './components/EventCard/EventCard.css';

function App() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    loadFeaturedEvents();
  }, []);

  const loadFeaturedEvents = async () => {
    try {
      setFeaturedLoading(true);
      const response = await searchService.getFeaturedEvents();

      if (response.success && response.data) {
        setFeaturedEvents(response.data.events || []);
      } else {
        console.error('Failed to load featured events:', response.error);
      }
    } catch (error) {
      console.error('Error loading featured events:', error);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const handleSearchClick = () => {
    setSearchModalOpen(true);
  };

  const handleSearchClose = () => {
    setSearchModalOpen(false);
  };

  const handleSearch = async (searchData: SearchFormData) => {
    try {
      setSearchLoading(true);
      const response = await searchService.searchEvents(searchData);

      if (response.success && response.data) {
        setSearchResults(response.data.events);
        setSearchModalOpen(false);
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

  return (
    <div className="App">
        <Header onSearchClick={handleSearchClick} />
        <Hero onSearchClick={handleSearchClick} />

        {/* Featured Events Section */}
        <section className="featured-events-section">
          <div className="container">
            <h2>Featured Events</h2>
            <div className="event-cards-grid">
              {featuredLoading ? (
                <p className="loading-message">Loading featured events...</p>
              ) : featuredEvents.length > 0 ? (
                featuredEvents.map((event, index) => (
                  <EventCard key={event.id || index} event={event} />
                ))
              ) : (
                <p className="no-results-message">No featured events available at the moment.</p>
              )}
            </div>
          </div>
        </section>

        {/* Search Results Section */}
        {searchResults.length > 0 && (
          <section className="results-section">
            <div className="container">
              <h2>Search Results</h2>
              <div className="event-cards-grid">
                {searchResults.map((event, index) => (
                  <EventCard key={event.id || index} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section about">
                <h3>EventFinder</h3>
                <p>
                  Discover incredible live events near you. Upfront pricing, relevant
                  recommendations, and easy access to unforgettable experiences.
                </p>
              </div>
              <div className="footer-section links">
                <h3>Quick Links</h3>
                <ul>
                  <li><a href="#browse">Browse Events</a></li>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#help">Help</a></li>
                </ul>
              </div>
              <div className="footer-section social">
                <h3>Connect With Us</h3>
                <div className="social-icons">
                  <a href="#facebook">Facebook</a>
                  <a href="#twitter">Twitter</a>
                  <a href="#instagram">Instagram</a>
                  <a href="#linkedin">LinkedIn</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              &copy; 2025 EventFinder. All rights reserved.
            </div>
          </div>
        </footer>

        {/* Search Modal */}
        <SearchModal
          isOpen={searchModalOpen}
          onClose={handleSearchClose}
          onSearch={handleSearch}
          loading={searchLoading}
        />
    </div>
  );
}

export default App;
