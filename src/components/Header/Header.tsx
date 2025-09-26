import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Menu, X, Ticket, User, LogOut } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
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

            {isAuthenticated ? (
              <li className="user-dropdown">
                <button className="search-btn">
                  <User size={16} /> Hi, {user?.username}
                </button>
                <button onClick={logout} className="primary-btn small-btn">
                  <LogOut size={16} /> Logout
                </button>
              </li>
            ) : (
              <li className="auth-buttons">
                <button className="primary-btn small-btn">Login</button>
                <button className="primary-btn small-btn">Sign Up</button>
              </li>
            )}
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

          {!isAuthenticated && (
            <>
              <li>
                <button className="login-btn-mobile" onClick={closeMobileMenu}>
                  Login
                </button>
              </li>
              <li>
                <button className="signup-btn-mobile" onClick={closeMobileMenu}>
                  Sign Up
                </button>
              </li>
            </>
          )}

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

          {isAuthenticated && (
            <li>
              <button
                className="logout-btn-mobile"
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </li>
          )}

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