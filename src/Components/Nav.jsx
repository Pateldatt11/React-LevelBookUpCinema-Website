import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Nav.css';
import { AuthContext } from '../context/AuthContext';

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
      <Link to="/" className="logo-link" onClick={closeMenu}>
        <div className="logo">
          <span>LevelBookUp</span>Cinema
        </div>
      </Link>


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
            to="/about"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeMenu}
          >
            About Us
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/movies"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={closeMenu}
          >
            Movies
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/services"
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

      <AuthButtons />


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

function AuthButtons() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="auth-buttons">
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'auth-btn profile-btn active' : 'auth-btn profile-btn'}>
          {user.profileImage ? (
            <img src={user.profileImage} alt="me" style={{ width: 26, height: 26, borderRadius: 999, marginRight: 8, verticalAlign: 'middle' }} />
          ) : null}
          Profile
        </NavLink>

        <button
          type="button"
          className="auth-btn logout-btn"
          onClick={() => { logout(); navigate('/'); }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="auth-buttons">
      <NavLink to="/signup" className={({ isActive }) => isActive ? "auth-btn signup-btn active" : "auth-btn signup-btn"}>Sign Up</NavLink>
      <NavLink to="/login" className={({ isActive }) => isActive ? "auth-btn login-btn active" : "auth-btn login-btn"}>Login</NavLink>
    </div>
  );
}