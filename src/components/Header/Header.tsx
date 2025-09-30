import React from 'react';
import { MapPin, Settings } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onSearchClick: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchClick, onSettingsClick }) => {
  return (
    <header className="whatsup-header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="logo">
            What's<MapPin className="location-pin" />UP
          </h1>
          <p className="tagline">
            Finde<br />
            einzigartige<br />
            Events!
          </p>
        </div>

        <div className="header-actions">
          <button className="demo-button">
            <span className="demo-icon">🎭</span>
            DEMO
          </button>
          <button className="settings-button" onClick={onSettingsClick}>
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;