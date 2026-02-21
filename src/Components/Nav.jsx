import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Nav.css';

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">

      <div className="logo">
        <span>LevelBookxUp</span>Cinema
      </div>


      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            end
            onClick={closeMenu}
            
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/About"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeMenu}
          >
            About Us
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/Movies"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeMenu}
          >
            Movies
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/Services"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeMenu}
          >
            Services
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeMenu}
          >
            Contact Us
          </NavLink>
        </li>
      </ul>

      <div className="auth-buttons">
        <NavLink
          to="/Signup"
          className={({ isActive }) =>
            isActive
              ? "auth-btn signup-btn active"
              : "auth-btn signup-btn"
          }
        >
          Sign Up
        </NavLink>

        <NavLink
          to="/Login"
          className={({ isActive }) =>
            isActive
              ? "auth-btn login-btn active"
              : "auth-btn login-btn"
          }
        >
          Login
        </NavLink>
      </div>


      <button
        className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

    </nav>


  );
};

export default Nav;