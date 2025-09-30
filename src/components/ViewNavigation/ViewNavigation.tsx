import React from 'react';
import { List, Map, Filter, Plus } from 'lucide-react';
import './ViewNavigation.css';

export type ViewType = 'list' | 'map' | 'filter' | 'new';

interface ViewNavigationProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewNavigation: React.FC<ViewNavigationProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="view-navigation">
      <button
        className={`nav-button ${activeView === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
      >
        <List size={18} />
        Liste
      </button>

      <button
        className={`nav-button ${activeView === 'map' ? 'active' : ''}`}
        onClick={() => onViewChange('map')}
      >
        <Map size={18} />
        Karte
      </button>

      <button
        className={`nav-button ${activeView === 'filter' ? 'active' : ''}`}
        onClick={() => onViewChange('filter')}
      >
        <Filter size={18} />
        Filter
      </button>

      <button
        className={`nav-button ${activeView === 'new' ? 'active' : ''}`}
        onClick={() => onViewChange('new')}
      >
        <Plus size={18} />
        Neu
      </button>
    </div>
  );
};

export default ViewNavigation;