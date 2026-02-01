import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const auth = useContext(AuthContext) || {}; 
  const { user, logout = () => {} } = auth;
  const navigate = useNavigate();

  
  if (!user) {
    navigate('/Login');
    return null;
  }

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="hero-overlay"></div>
        <div className="profile-content">
          <h1 className="profile-title">
            Hello, <span className="highlight">{user.username || user.name || 'User'}</span>!
          </h1>
          <p className="profile-subtitle">Your LevelBookUp Account</p>
        </div>
        <div className="hero-glow"></div>
      </section>

      <section className="profile-section">
        <div className="profile-card">
          <h2>Account Details</h2>
          <div className="profile-detail">
            <span>Name:</span> <strong>{user.name || 'N/A'}</strong>
          </div>
          <div className="profile-detail">
            <span>Username:</span> <strong>{user.username || 'N/A'}</strong>
          </div>
          <div className="profile-detail">
            <span>Email:</span> <strong>{user.email || 'N/A'}</strong>
          </div>
          <div className="profile-detail">
            <span>Joined:</span> <strong>{new Date().toLocaleDateString()}</strong>
          </div>

          <button 
            className="logout-btn-full"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;