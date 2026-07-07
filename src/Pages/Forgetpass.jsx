import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Forgetpass.css'; 
import { getEmailJsPublicKey, getEmailJsServiceId, getEmailJsTemplateId } from '../utils/runtimeConfig';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setResetLink('');

    if (!email) {
      setError('Email દાખલ કરો!');
      return;
    }

    const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const payload = { email, expiresAt };
    const tokens = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
    tokens[token] = payload;
    localStorage.setItem('password_reset_tokens', JSON.stringify(tokens));

    const resetLink = `${window.location.origin}/reset-password/${token}`;
    const serviceId = getEmailJsServiceId();
    const templateId = getEmailJsTemplateId();
    const publicKey = getEmailJsPublicKey();

    if (serviceId && templateId && publicKey) {
      const resetMessage = [
        `Hi ${email},`,
        '',
        `Please open the link to reset your password: ${resetLink}`,
        '',
        `If you didn't request this, ignore this email.`,
        '',
        'Regards,',
        'LevelBookUp Cinema',
      ].join('\n');

      const emailTemplateParams = {
        to_email: email,
        to_name: email,
        user_email: email,
        recipient_email: email,
        email,
        reset_link: resetLink,
        resetLink,
        reset_url: resetLink,
        link: resetLink,
        title: 'Reset your password',
        subject: 'LevelBookUp Cinema - Password Reset',
        message: resetMessage,
        html_message: resetMessage.replace(/\n/g, '<br/>'),
        expires_in_minutes: 15,
        expires_at: new Date(expiresAt).toLocaleString(),
      };

      emailjs.send(serviceId, templateId, {
        ...emailTemplateParams,
      }, publicKey).then(() => {
        setMessage(`Reset email sent to ${email}. Check your inbox.`);
        setEmail('');
      }).catch(() => {
        setMessage(`Reset link created for ${email}.`);
        setResetLink(resetLink);
        setEmail('');
      });
      return;
    }

    setMessage(`Reset link created for ${email}.`);
    setResetLink(resetLink);
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
          {resetLink && (
            <div className="reset-link-box">
              <span className="reset-link-label">Reset link</span>
              <a href={resetLink} className="reset-link-value" target="_blank" rel="noreferrer">
                {resetLink}
              </a>
            </div>
          )}

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