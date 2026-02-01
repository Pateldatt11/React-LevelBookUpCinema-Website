import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email અને Password બંને જરૂરી છે!');
      return;
    }

    
   
    login({
      name: 'Patel',
      username: 'patel123',
      email: formData.email,
    });

    alert('Login Successful! Welcome back!');
   
    navigate('/Movies');

    setFormData({ email: '', password: '' });
  };

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="hero-overlay"></div>
        <div className="login-content">
          <h1 className="login-title">
            Welcome <span className="highlight">Back</span>
          </h1>
          <p className="login-subtitle">
            Log in to your account and continue booking your favorite movies.
          </p>
        </div>
        <div className="hero-glow"></div>
      </section>

      <section className="login-form-section">
        <div className="form-container">
          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>

          <div className="auth-links">
            <p>
              Don't have an account? <Link to="/Signup" className="link">Sign Up here</Link>
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

export default Login;