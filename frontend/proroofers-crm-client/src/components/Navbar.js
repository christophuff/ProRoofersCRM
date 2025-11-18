import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import '../styles/navbar.css';

export default function Navbar({ currentSection, onSectionChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (section) => {
    onSectionChange(section);
    closeMenu();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleMenu();
    }
  };

  return (
    <nav className="nav-container">
      <div className="navbar-links">
        <h1 className="logo">
          <div className="navbar-brand">
            <span className="logo-brand">PRI CRM</span>
          </div>
        </h1>
        
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <button 
              className={`nav-link ${currentSection === 'tasks' ? 'active' : ''}`}
              onClick={() => handleNavClick('tasks')}
            >
              Tasks
            </button>
            <button 
              className={`nav-link ${currentSection === 'customers' ? 'active' : ''}`}
              onClick={() => handleNavClick('customers')}
            >
              Customers
            </button>
            <button 
              className={`nav-link ${currentSection === 'projects' ? 'active' : ''}`}
              onClick={() => handleNavClick('projects')}
            >
              Projects
            </button>
            {user.role === 1 && ( // Admin only
              <button 
                className={`nav-link ${currentSection === 'users' ? 'active' : ''}`}
                onClick={() => handleNavClick('users')}
              >
                Users
              </button>
            )}
          </li>
          <li className="nav-actions">
            <div className="user-info">
              <span className="username">{user.username}</span>
              <span className="user-role">({user.role === 1 ? 'Admin' : 'Staff'})</span>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div 
        className="hamburger" 
        onClick={toggleMenu} 
        onKeyDown={handleKeyDown} 
        role="button" 
        tabIndex={0} 
        aria-label="Toggle navigation menu"
      >
        <div className={`line ${isMenuOpen ? 'open' : ''}`} />
        <div className={`line ${isMenuOpen ? 'open' : ''}`} />
        <div className={`line ${isMenuOpen ? 'open' : ''}`} />
      </div>
    </nav>
  );
}