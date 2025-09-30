import React, { useState } from 'react';
import { Search, Menu, X, Ticket } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onSearchClick: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchClick, onSettingsClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <a href="/" className="logo">
            <Ticket size={24} /> EventFinder
          </a>
        </div>

        <nav className="navbar-right">
          <ul>
            <li><a href="#browse">Browse events</a></li>
            <li><a href="#help">Get help</a></li>
            <li>
              <button onClick={onSearchClick} className="search-btn">
                <Search size={16} /> Search
              </button>
            </li>
          </ul>
        </nav>

        <button
          className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul>
          <li><a href="#browse" onClick={closeMobileMenu}>Browse events</a></li>
          <li><a href="#help" onClick={closeMobileMenu}>Get help</a></li>
          <li>
            <button
              className="search-btn-mobile"
              onClick={() => {
                onSearchClick();
                closeMobileMenu();
              }}
            >
              <Search size={16} /> Search Events
            </button>
          </li>
          <li>
            <button className="close-mobile-menu" onClick={closeMobileMenu}>
              <X size={16} /> Close
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;