import React from 'react';
import './Services.css';

const Services = () => {
  const servicesList = [
    {
      title: "Instant Ticket Booking",
      description: "Book your favorite seats in just a few clicks — real-time availability, no queues, no hassle.",
      icon: "🎟️",
      color: "var(--primary)",
    },
    {
      title: "Premium Seat Selection",
      description: "Choose exactly where you want to sit — Gold, Platinum, Recliner, or Couple seats with live seat map.",
      icon: "🪑",
      color: "#ff6b6b",
    },
    {
      title: "Exclusive Pre-bookings & Premieres",
      description: "Get early access to blockbuster premieres, fan screenings, and special events before anyone else.",
      icon: "⭐",
      color: "#ffd166",
    },
    {
      title: "Food & Beverage Pre-order",
      description: "Order popcorn, cold drinks, combos directly from your seat — delivered hot & fresh during interval.",
      icon: "🍿🥤",
      color: "#06d6a0",
    },
    {
      title: "Movie Recommendations & Trailers",
      description: "Personalized suggestions based on your taste + watch latest trailers without leaving the app.",
      icon: "🎥",
      color: "#118ab2",
    },
    {
      title: "24/7 Customer Support",
      description: "Any issue with booking, refund, or seat? Our team is available round-the-clock to help you.",
      icon: "🛎️",
      color: "#ef476f",
    },
  ];

  return (
    <div className="services-page">
      
      <section className="services-hero">
        <div className="hero-overlay"></div>
        <div className="services-content">
          <h1 className="services-title">
            Our <span className="highlight">Services</span>
          </h1>
          <p className="services-subtitle">
            Everything you need for the ultimate cinema experience — made simple, fast, and unforgettable.
          </p>
        </div>
        <div className="hero-glow"></div>
      </section>

    
      <section className="services-section">
        <div className="services-grid">
          {servicesList.map((service, index) => (
            <div 
              className="service-card" 
              key={index}
              style={{ '--card-color': service.color }}
            >
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

     
      <section className="services-cta">
        <h2>Ready for your next movie night?</h2>
        <p>Explore 69+ movies and book your seats now!</p>
        <a href="/Movies" className="btn-primary cta-btn">
          Browse Movies
        </a>
      </section>
    </div>
  );
};

export default Services;