import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import './FilterSidebar.css';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: any) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose, onFiltersChange }) => {
  const [quickFilters, setQuickFilters] = useState({
    time: '',
    price: '',
    distance: '',
    special: ''
  });

  const timeOptions = [
    { value: 'jetzt', label: 'Jetzt' },
    { value: 'heute', label: 'Heute' },
    { value: 'morgen', label: 'Morgen' },
  ];

  const priceOptions = [
    { value: 'gratis', label: 'Gratis' },
    { value: '<20', label: '< 20.-' },
    { value: '<50', label: '< 50.-' },
    { value: 'egal', label: 'Egal' },
  ];

  const distanceOptions = [
    { value: 'zu-fuss', label: 'Zu Fuss' },
    { value: '<5km', label: '< 5km' },
    { value: '<10km', label: '< 10km' },
    { value: 'egal', label: 'Egal' },
  ];

  const handleQuickFilterChange = (category: string, value: string) => {
    const newFilters = { ...quickFilters, [category]: value };
    setQuickFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const renderFilterGroup = (title: string, category: string, options: any[], icon: string) => (
    <div className="filter-group">
      <h4 className="filter-title">{title}</h4>
      <div className="filter-options">
        {options.map((option) => (
          <button
            key={option.value}
            className={`filter-option ${quickFilters[category as keyof typeof quickFilters] === option.value ? 'active' : ''}`}
            onClick={() => handleQuickFilterChange(category, option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="filter-sidebar-overlay">
      <div className="filter-sidebar">
        <div className="filter-header">
          <div className="filter-header-title">
            <Settings size={20} />
            <span>Schnellfilter</span>
          </div>
          <span className="active-filters-count">0 Filter aktiv</span>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="filter-content">
          {renderFilterGroup('WANN?', 'time', timeOptions, '⏰')}
          {renderFilterGroup('WIE TEUER?', 'price', priceOptions, '💰')}
          {renderFilterGroup('WIE WEIT?', 'distance', distanceOptions, '📍')}

          <div className="filter-group">
            <h4 className="filter-title">SPEZIAL</h4>
            <div className="special-options">
              <div className="special-option">
                <span>Diese Woche</span>
              </div>
              <div className="special-option">
                <span>Wochenende</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Map Section */}
        <div className="filter-map-section">
          <div className="mini-map">
            <div className="map-placeholder">
              <div className="map-region">Schweiz</div>
              <div className="map-region">Suisse/Svizzera</div>
              <div className="map-region">Svizra</div>
              <div className="location-markers">
                <div className="location-marker" style={{top: '30%', left: '40%'}}>📍</div>
                <div className="location-marker" style={{top: '60%', left: '35%'}}>📍</div>
                <div className="location-marker" style={{top: '45%', left: '60%'}}>📍</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;