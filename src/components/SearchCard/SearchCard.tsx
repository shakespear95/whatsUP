import React, { useState } from 'react';
import { MapPin, Target, Calendar, Wallet, Zap, Search, List } from 'lucide-react';
import { SEARCH_CONFIG } from '../../config/constants';
import { SearchFormData } from '../../types';
import './SearchCard.css';

interface SearchCardProps {
  onSearch: (searchData: SearchFormData) => void;
  loading: boolean;
  onShowPreviousResults: () => void;
  hasPreviousResults: boolean;
}

const SearchCard: React.FC<SearchCardProps> = ({
  onSearch,
  loading,
  onShowPreviousResults,
  hasPreviousResults
}) => {
  const [searchMode, setSearchMode] = useState<'standard' | 'discover'>('discover');
  const [formData, setFormData] = useState<SearchFormData>({
    location: 'Zürich, Schweiz',
    activity_type: 'Any',
    timeframe: 'Diese Woche (25.09. - 28.09.)',
    radius: 25,
    keywords: '',
    email: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'radius' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      radius: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      alert('Please enter a location');
      return;
    }
    onSearch(formData);
  };

  return (
    <div className="search-card-container">
      <div className="search-card">
        {/* Standard/Entdecken Toggle */}
        <div className="search-mode-toggle">
          <button
            className={`mode-button ${searchMode === 'standard' ? 'active' : ''}`}
            onClick={() => setSearchMode('standard')}
          >
            <Target size={16} />
            Standard
          </button>
          <button
            className={`mode-button ${searchMode === 'discover' ? 'active' : ''}`}
            onClick={() => setSearchMode('discover')}
          >
            <Zap size={16} />
            Entdecken
          </button>
        </div>

        {/* Mode Description */}
        <p className="mode-description">
          Priorisiert einzigartige & experimentelle Events
        </p>

        <form onSubmit={handleSubmit} className="search-form">
          {/* Location Field */}
          <div className="form-row">
            <label className="field-label">
              <MapPin size={16} />
              STANDORT
            </label>
            <div className="form-field">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Zürich, Schweiz"
                className="location-input"
              />
              <button type="button" className="location-action">
                📍
              </button>
            </div>
          </div>

          {/* Radius Slider */}
          <div className="form-row">
            <label className="field-label">
              <Target size={16} />
              RADIUS
            </label>
            <div className="form-field">
              <div className="radius-control">
                <span className="radius-label">{formData.radius} km</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={formData.radius || 25}
                  onChange={handleRadiusChange}
                  className="radius-slider"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="form-row">
            <label className="field-label">
              📁
              KATEGORIEN
            </label>
            <div className="form-field">
              <select
                name="activity_type"
                value={formData.activity_type}
                onChange={handleInputChange}
                className="dropdown-select"
              >
                <option value="">Kategorien wählen</option>
                {SEARCH_CONFIG.ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <span className="dropdown-arrow">›</span>
            </div>
          </div>

          {/* Date Dropdown */}
          <div className="form-row">
            <label className="field-label">
              <Calendar size={16} />
              ZEITRAUM
            </label>
            <div className="form-field">
              <select
                name="timeframe"
                value={formData.timeframe}
                onChange={handleInputChange}
                className="dropdown-select"
              >
                <option value="Diese Woche (25.09. - 28.09.)">Diese Woche (25.09. - 28.09.)</option>
                <option value="Nächste Woche">Nächste Woche</option>
                <option value="Dieses Wochenende">Dieses Wochenende</option>
                <option value="Nächstes Wochenende">Nächstes Wochenende</option>
                <option value="Dieser Monat">Dieser Monat</option>
              </select>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          {/* Budget Dropdown */}
          <div className="form-row">
            <label className="field-label">
              <Wallet size={16} />
              BUDGET
            </label>
            <div className="form-field">
              <select className="dropdown-select">
                <option value="">Budget wählen</option>
                <option value="free">Kostenlos</option>
                <option value="0-25">0-25 CHF</option>
                <option value="25-50">25-50 CHF</option>
                <option value="50-100">50-100 CHF</option>
                <option value="100+">100+ CHF</option>
              </select>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="form-row">
            <label className="field-label">
              <Zap size={16} />
              FILTER
            </label>
            <div className="form-field">
              <select className="dropdown-select">
                <option value="">Filter wählen</option>
                <option value="outdoor">Outdoor Events</option>
                <option value="indoor">Indoor Events</option>
                <option value="family">Family Friendly</option>
                <option value="adult">Adults Only</option>
              </select>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          {/* Search Button */}
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Suche läuft...
              </>
            ) : (
              <>
                <Search size={16} />
                Event-Suche starten
              </>
            )}
          </button>

          {/* Previous Results Button */}
          {hasPreviousResults && (
            <button
              type="button"
              className="previous-results-button"
              onClick={onShowPreviousResults}
            >
              <List size={16} />
              Bisherige Ergebnisse anzeigen
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default SearchCard;