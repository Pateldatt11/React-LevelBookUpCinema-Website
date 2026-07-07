import React, { useRef, useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Signup.css';

// Inline SVG icons — embedded directly in code so they never break due to
// external URL downtime, CORS issues, or dead links (unlike svgrepo URLs).
const GoogleIcon = () => (
  <svg className="social-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.6 0-14.1 4.3-17.4 10.7z"/>
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.5-5.5C29.6 35.3 27 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.8 39.6 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C40.8 36.4 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="social-icon" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
    <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
    <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
    <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a10.98 10.98 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.08.78 2.17 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
  </svg>
);

const Signup = () => {
  const navigate = useNavigate();
  const { register, registerWithGoogle, registerWithMicrosoft, registerWithGithub } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dob: '',
    city: '',
    state: '',
    address: '',
  });

  // Preview is a local blob URL for display only. The actual File object is what
  // gets uploaded to Firebase Storage on submit — never converted to base64.
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const lastObjectUrl = useRef(null);

  const [error, setError] = useState('');
  const [imageName, setImageName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (file) => {
    if (!file || !file.type?.startsWith('image/')) {
      setError('Please choose a valid image file.');
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image is too large. Please choose one under ${MAX_SIZE_MB}MB.`);
      return;
    }

    if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
    const previewUrl = URL.createObjectURL(file);
    lastObjectUrl.current = previewUrl;

    setProfileImagePreview(previewUrl);
    setProfileImageFile(file);
    setImageName(file.name);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const resetForm = () => {
    setFormData({
      name: '', username: '', email: '', password: '', confirmPassword: '',
      phone: '', dob: '', city: '', state: '', address: '',
    });
    if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
    setProfileImagePreview('');
    setProfileImageFile(null);
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    setSubmitting(true);

    (async () => {
      const registration = await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dob: formData.dob,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        profileImageFile, // File object — uploaded to Storage inside register(), not base64
      });

      setSubmitting(false);

      if (!registration.success) {
        setError(registration.message || 'Signup failed');
        return;
      }

      resetForm();
      navigate('/movies');
    })();
  };

  const handleGoogleSignup = async () => {
    setError('');
    setSubmitting(true);
    const result = await registerWithGoogle();
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }
    navigate('/movies');
  };

  const handleMicrosoftSignup = async () => {
    setError('');
    setSubmitting(true);
    const result = await registerWithMicrosoft();
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }
    navigate('/movies');
  };

  const handleGithubSignup = async () => {
    setError('');
    setSubmitting(true);
    const result = await registerWithGithub();
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }
    navigate('/movies');
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

            <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
            <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} />
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />

            <label
              className="file-drop signup-drop"
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(event) => {
                  const file = event.target.files && event.target.files[0];
                  if (file) handleFile(file);
                }}
              />
              <span className="signup-drop-title">Drag & drop profile photo here, or click to choose</span>
              <span className="signup-drop-note">PNG, JPG, JPEG supported</span>
            </label>

            {profileImagePreview ? (
              <div className="signup-preview-row">
                <img src={profileImagePreview} alt="profile preview" className="signup-preview" />
                <div className="signup-preview-meta">
                  <strong>Profile photo selected</strong>
                  <span>{imageName || 'Uploaded image'}</span>
                </div>
              </div>
            ) : null}

            <button type="submit" className="signup-btn" disabled={submitting}>
              {submitting ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <div className="divider"><span>OR</span></div>

          <div className="social-buttons">
            <button type="button" className="signup-btn google-btn" onClick={handleGoogleSignup} disabled={submitting}>
              <GoogleIcon />
              Continue with Google
            </button>
            <button type="button" className="signup-btn github-btn" onClick={handleGithubSignup} disabled={submitting}>
              <GithubIcon />
              Continue with GitHub
            </button>
            <button type="button" className="signup-btn microsoft-btn" onClick={handleMicrosoftSignup} disabled={submitting}>
              <MicrosoftIcon />
              Continue with Microsoft
            </button>
          </div>

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