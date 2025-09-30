import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { SEARCH_CONFIG } from '../../config/constants';
import { SearchFormData } from '../../types';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchData: SearchFormData) => void;
  loading: boolean;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  loading
}) => {
  const [formData, setFormData] = useState<SearchFormData>({
    location: '',
    activity_type: 'Any',
    timeframe: 'This Weekend',
    radius: undefined,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      alert('Please enter a location');
      return;
    }
    onSearch(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal open">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Find Your Next Event</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., palma de mallorca"
            required
          />

          <label htmlFor="activity_type">Activity Type:</label>
          <select
            id="activity_type"
            name="activity_type"
            value={formData.activity_type}
            onChange={handleInputChange}
          >
            {SEARCH_CONFIG.ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label htmlFor="timeframe">Timeframe:</label>
          <select
            id="timeframe"
            name="timeframe"
            value={formData.timeframe}
            onChange={handleInputChange}
          >
            {SEARCH_CONFIG.TIMEFRAMES.map((timeframe) => (
              <option key={timeframe} value={timeframe}>
                {timeframe}
              </option>
            ))}
          </select>

          <label htmlFor="radius">Radius (km, optional):</label>
          <input
            type="number"
            id="radius"
            name="radius"
            value={formData.radius || ''}
            onChange={handleInputChange}
            min="1"
            placeholder="20"
          />

          <label htmlFor="keywords">Keywords (optional):</label>
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
            placeholder="family with kids 11 years"
          />

          <label htmlFor="email">Email for results (optional):</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="youremail@example.com"
          />

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search Events
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchModal;