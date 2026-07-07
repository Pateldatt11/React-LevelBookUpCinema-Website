import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './Forgetpass.css';

const loadTokens = () => {
  try {
    return JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
  } catch {
    return {};
  }
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const tokenRecord = useMemo(() => loadTokens()[token] || null, [token]);

  const updateUsers = (email, nextPassword) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const nextUsers = users.map((user) => (user.email === email ? { ...user, password: nextPassword } : user));
    localStorage.setItem('users', JSON.stringify(nextUsers));

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser && currentUser.email === email) {
      localStorage.setItem('user', JSON.stringify({ ...currentUser, password: nextPassword }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const tokens = loadTokens();
    const record = tokens[token];

    if (!record) {
      setError('Reset link invalid or already used.');
      return;
    }

    if (Date.now() > Number(record.expiresAt || 0)) {
      delete tokens[token];
      localStorage.setItem('password_reset_tokens', JSON.stringify(tokens));
      setError('Reset link expired. Please request a new one.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    updateUsers(record.email, password);
    delete tokens[token];
    localStorage.setItem('password_reset_tokens', JSON.stringify(tokens));

    setMessage('Password updated successfully. You can log in now.');
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className="forgot-page">
      <section className="forgot-hero">
        <div className="hero-overlay" />
        <div className="forgot-content">
          <h1 className="forgot-title">
            Reset <span className="highlight">Password</span>
          </h1>
          <p className="forgot-subtitle">
            {tokenRecord ? `Resetting password for ${tokenRecord.email}` : 'Open a valid reset link from your email.'}
          </p>
        </div>
        <div className="hero-glow" />
      </section>

      <section className="forgot-form-section">
        <div className="form-container">
          {error ? <div className="error-message">{error}</div> : null}
          {message ? <div className="success-message">{message}</div> : null}

          <form className="forgot-form" onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <button type="submit" className="reset-btn">
              Update Password
            </button>
          </form>

          <div className="back-link">
            <Link to="/login" className="link">
              ← Back to Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPassword;