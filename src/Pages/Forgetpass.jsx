import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Forgetpass.css'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Email દાખલ કરો!');
      return;
    }

   
    setMessage('Password reset link sent to ' + email);
    setEmail('');
  };

  return (
    <div className="forgot-page">
      <section className="forgot-hero">
        <div className="hero-overlay"></div>
        <div className="forgot-content">
          <h1 className="forgot-title">
            Forgot <span className="highlight">Password?</span>
          </h1>
          <p className="forgot-subtitle">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>
        <div className="hero-glow"></div>
      </section>

      <section className="forgot-form-section">
        <div className="form-container">
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <form className="forgot-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className="reset-btn">
              Send Reset Link
            </button>
          </form>

          <div className="back-link">
            <Link to="/Login" className="link">
              ← Back to Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;