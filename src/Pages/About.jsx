import React from 'react';
import './About.css';
import { Link } from 'react-router-dom'; 

const About = () => {
  return (
    <div className="about-page">
      
      <section className="about-hero">
        <div className="hero-overlay"></div>
        
        <div className="about-content">
          <h1 className="about-title">
            About <span className="highlight">LevelBookUp</span>Cinema
          </h1>
          
          <p className="about-subtitle">
            Your ultimate destination for cinematic experiences — where every seat tells a story and every ticket opens a new world.
          </p>
        </div>

        <div className="hero-glow"></div>
      </section>

      <section className="about-section">
        <div className="content-wrapper">
          <div className="story-block">
            <h2>Our Story</h2>
            <p>
              Founded in 2023 with a simple passion for movies and technology, LevelBookUp Cinema was born to make cinema more accessible, exciting, and unforgettable. 
              Tired of complicated booking processes and missed showtimes, we created a platform that puts the power of the big screen in your hands — instantly, beautifully, and reliably.
            </p>
            <p>
              Today, we connect movie lovers across cities with the latest blockbusters, indie gems, regional cinema, and exclusive premieres — all with seamless booking, real-time seat selection, and zero hassle.
            </p>
          </div>

          <div className="mission-vision-grid">
            <div className="card mission">
              <h3>Our Mission</h3>
              <p>To revolutionize how India experiences cinema — making every ticket purchase feel like the start of an epic adventure.</p>
            </div>

            <div className="card vision">
              <h3>Our Vision</h3>
              <p>To be the most loved cinema companion — delivering joy, convenience, and magic in every frame, every click, every seat.</p>
            </div>
          </div>

          <div className="team-teaser">
            <h2>Meet The Team</h2>
            <p>
              A passionate group of cinephiles, developers, and dreamers working behind the scenes to bring you closer to the stories you love.
            </p>

            <div className="team-placeholder">
              <div className="member-stub">Founder & CEO</div>
              <div className="member-stub">Lead Developer</div>
              <div className="member-stub">Creative Director</div>
            </div>
          </div>

          <div className="cta-final">
            <h3>Ready to experience the magic?</h3>
            <Link to="/Movies" className="btn-primary">
              Explore Movies Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;