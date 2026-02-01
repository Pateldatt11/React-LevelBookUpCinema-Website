import React from 'react';
import './Home.css';           
import { Link } from 'react-router-dom';   

const Home = () => {
  return (
    <div className="home-page">
      
      <section className="hero">
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            Experience Cinema <span className="highlight">Like Never Before</span>
          </h1>
          
          <p className="hero-subtitle">
            Discover The Latest Blockbusters, Exclusive Trailers, And Book Tickets Instantly — 
            All In One Electrifying Place.
          </p>

          <div className="hero-cta-group">
            <Link 
              to="/Movies" 
              className="btn-primary"
            >
              Explore Movies
            </Link>
            
            <button className="btn-outline">
              Watch Trailer
            </button>
          </div>
        </div>


        <div className="hero-glow"></div>
      </section>

     
     
    </div>
  );
};

export default Home;