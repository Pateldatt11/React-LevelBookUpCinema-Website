import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
       
        <div className="footer-brand">
          <div className="footer-logo">
            <span>LevelBookUp</span>Cinema
          </div>
          <p className="footer-tagline">
            Experience Cinema Like Never Before – Book, Watch, Enjoy!
          </p>
        </div>

        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/About">About Us</NavLink></li>
            <li><NavLink to="/Movies">Movies</NavLink></li>
            <li><NavLink to="/Services">Services</NavLink></li>
            <li><NavLink to="/contact">Contact Us</NavLink></li>
          </ul>
        </div>

        
        <div className="footer-section">
          <h3>Account</h3>
          <ul>
            <li><NavLink to="/Signup">Sign Up</NavLink></li>
            <li><NavLink to="/Login">Login</NavLink></li>
            <li><NavLink to="/profile">My Profile</NavLink></li>
          </ul>
        </div>

        
        <div className="footer-section">
          <h3>Follow & Connect</h3>
          <div className="footer-social">
            <a href="https://www.instagram.com/d_a_t_t_p_a_t_e_l_1_8?igsh=NWJhcTJjMWw3cml3" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instgram
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://x.com/PatelDatt18" target="_blank" rel="noopener noreferrer" aria-label="Twitter">X
              <i className="fab fa-twitter"></i>
            </a>
            
            <a href="https://youtube.com/@pateldatt18" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube
              <i className="fab fa-youtube"></i>
            </a>
          </div>

          <p className="footer-contact">
            support@levelbookup.com<br />
            +91 98765 43210
          </p>
        </div>
      </div>

     
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LevelBookUp Cinema. All Rights Reserved.</p>
        <p>Made with ❤️ in Surat,Gujarat, India</p>
      </div>
    </footer>
  );
};

export default Footer;