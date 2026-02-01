import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError('All fields are required!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

  
    login({
      name: formData.name,
      username: formData.username,
      email: formData.email,
     
    });

    alert('Signup Successful! Welcome, ' + formData.username);
    
    navigate('/Movies');

    
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="signup-page">
      <section className="signup-hero">
        <div className="hero-overlay"></div>
        <div className="signup-content">
          <h1 className="signup-title">
            Join <span className="highlight">LevelBookUp</span>
          </h1>
          <p className="signup-subtitle">
            Create your account and start booking your favorite movies today!
          </p>
        </div>
        <div className="hero-glow"></div>
      </section>

      <section className="signup-form-section">
        <div className="form-container">
          {error && <div className="error-message">{error}</div>}

          <form className="signup-form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />

            <button type="submit" className="signup-btn">
              Sign Up
            </button>
          </form>

          <div className="auth-links">
            <p>
              Already have an account? <Link to="/Login" className="link">Login here</Link>
            </p>
            <p>
              <Link to="/forgetpass" className="link">Forgot Password?</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;