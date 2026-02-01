import React, { useState } from 'react';
import './Contactus.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you! Your message has been sent. We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
   
      <div style={{ color: 'lime', padding: '1rem', textAlign: 'center' }}>
        Contact Us Page Loaded Successfully!
      </div>
      

      
      <section className="contact-hero">
        <div className="hero-overlay"></div>
        <div className="contact-content">
          <h1 className="contact-title">
            Contact <span className="highlight">Us</span>
          </h1>
          <p className="contact-subtitle">
            Have questions about movies, bookings, or anything else? We're here for you 24/7.
          </p>
        </div>
        <div className="hero-glow"></div>
      </section>

      
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>Our Location</h3>
              <p>LevelBookUp Cinema HQ<br />Surat, Gujarat, India</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>Phone</h3>
              <p>+91 98765 43210<br />Mon–Sun: 10 AM – 10 PM</p>
            </div>

            <div className="info-card">
              <div className="info-icon">✉️</div>
              <h3>Email</h3>
              <p>support@levelbookup.com<br />help@levelbookup.com</p>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>

              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="contact-map-section">
        <div className="map-placeholder">
          <p>📍 Our Office Location – Surat</p>
          
        </div>
      </section>
      <center>    
      <section className='mapplaceholder2'>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.1667790780602!2d72.8003485!3d21.145760100000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be05203d87284f1%3A0xc550f071f2d34a38!2sShyam%20Mandir%20Rd%2C%20Anand%20Park%2C%20Althan%2C%20Surat%2C%20Gujarat%20395007!5e0!3m2!1sen!2sin!4v1769925056583!5m2!1sen!2sin"></iframe>
      </section>
      </center>
      <br /><br /><br /><br /><br />
    </div>
  );
};

export default ContactUs;  