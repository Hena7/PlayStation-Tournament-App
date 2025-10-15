
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="logo">
          <NavLink to="/">TournamentApp</NavLink>
        </div>
        <nav className="nav">
          <ul>
            <li><NavLink to="/" exact activeClassName="active">Home</NavLink></li>
            <li><NavLink to="/login" activeClassName="active">Login</NavLink></li>
            <li><NavLink to="/register" activeClassName="active">Register</NavLink></li>
            <li><NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink></li>
            <li><NavLink to="/admin" activeClassName="active">Admin</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
