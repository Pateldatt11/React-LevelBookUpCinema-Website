import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { unbookSeats } from '../utils/seatReservations';
import './Profile.css';

const Profile = () => {
  const auth = useContext(AuthContext) || {};
  const { user, logout = () => {}, updateProfile } = auth;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // profileImagePreview: what we SHOW (existing URL, or a local blob preview of a newly picked file)
  // profileImageFile: the actual File object to upload, only set when user picks a NEW image
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    city: user?.city || '',
    state: user?.state || '',
    address: user?.address || '',
    profileImagePreview: user?.profileImage || '',
    profileImageFile: null,
  }));

  // Track the last object URL we created so we can revoke it and avoid memory leaks
  const lastObjectUrl = useRef(null);

  useEffect(() => {
    // when user changes (from storage events), sync form data
    // schedule update to avoid synchronous setState within effect
    const t = setTimeout(() => {
      setFormData({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dob: user?.dob || '',
        city: user?.city || '',
        state: user?.state || '',
        address: user?.address || '',
        profileImagePreview: user?.profileImage || '',
        profileImageFile: null,
      });
    }, 0);
    return () => clearTimeout(t);
  }, [user]);

  useEffect(() => {
    // cleanup any blob preview URL when component unmounts
    return () => {
      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
    };
  }, []);

  const handleFile = (file) => {
    if (!file) return;

    // Optional but recommended: block obviously oversized uploads before they even
    // hit Firebase Storage (e.g. > 5MB). Adjust the limit as you like.
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSaveError(`Image is too large. Please choose one under ${MAX_SIZE_MB}MB.`);
      return;
    }

    if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
    const previewUrl = URL.createObjectURL(file);
    lastObjectUrl.current = previewUrl;

    setSaveError('');
    setFormData((s) => ({ ...s, profileImagePreview: previewUrl, profileImageFile: file }));
  };

  const navigate = useNavigate();

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError('');

    const payload = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      city: formData.city,
      state: formData.state,
      address: formData.address,
    };

    // Only include the file if the user actually picked a new one
    if (formData.profileImageFile) {
      payload.profileImageFile = formData.profileImageFile;
    }

    const result = await updateProfile(payload);
    setSaving(false);

    if (!result || !result.success) {
      setSaveError(result?.message || 'Could not save profile. Please try again.');
      return; // keep the edit panel open so the user doesn't lose their input
    }

    setIsEditing(false);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
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
        <div className="profile-card profile-grid">
          <div className="profile-left">
            <img src={user.profileImage || '/assets/default-avatar.png'} alt="avatar" className="profile-avatar" />
            <h3>{user.name || 'N/A'}</h3>
            <div className="profile-meta">@{user.username || 'user'}</div>
          </div>

          <div className="profile-right">
            <h2>Account Details</h2>
            <div className="profile-detail"><span>Email:</span> <strong>{user.email || 'N/A'}</strong></div>
            <div className="profile-detail"><span>Phone:</span> <strong>{user.phone || 'N/A'}</strong></div>
            <div className="profile-detail"><span>DOB:</span> <strong>{user.dob || 'N/A'}</strong></div>
            <div className="profile-detail"><span>City:</span> <strong>{user.city || 'N/A'}</strong></div>
            <div className="profile-detail"><span>State:</span> <strong>{user.state || 'N/A'}</strong></div>
            <div className="profile-detail"><span>Address:</span> <strong>{user.address || 'N/A'}</strong></div>
            <div className="profile-detail"><span>Joined:</span> <strong>{user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}</strong></div>

            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <button type="button" className="logout-btn-full" onClick={() => { setSaveError(''); setIsEditing((s) => !s); }}>
                {isEditing ? 'Close' : 'Edit Profile'}
              </button>
              <button
                type="button"
                className="logout-btn-full"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="profile-edit">
              <h3>Edit Profile</h3>
              <div className="edit-grid">
                <input name="name" placeholder="Full name" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                <input name="username" placeholder="Username" value={formData.username} onChange={(e)=>setFormData({...formData, username: e.target.value})} />
                <input name="email" placeholder="Email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
                <input name="phone" placeholder="Phone" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} />
                <input name="dob" type="date" placeholder="DOB" value={formData.dob} onChange={(e)=>setFormData({...formData, dob: e.target.value})} />
                <input name="city" placeholder="City" value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})} />
                <input name="state" placeholder="State" value={formData.state} onChange={(e)=>setFormData({...formData, state: e.target.value})} />
                <input name="address" placeholder="Address" value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} />
              </div>
              <div style={{ marginTop: 10 }}>
                <label className="file-drop" onDragOver={(e)=>{e.preventDefault(); e.dataTransfer.dropEffect = 'copy';}} onDrop={(e)=>{e.preventDefault(); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(f) handleFile(f);}}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e)=>{ const f = e.target.files && e.target.files[0]; if(f) handleFile(f); }} />
                  Drag & drop an image here, or click to choose
                </label>
                {formData.profileImagePreview ? <div style={{ marginTop: 8 }}><img src={formData.profileImagePreview} alt="preview" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} /></div> : null}
              </div>
              {saveError ? <p style={{ color: '#ff7b7b', marginTop: 10 }}>{saveError}</p> : null}
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button type="button" className="signup-btn" disabled={saving} onClick={handleSaveProfile}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="logout-btn-full" onClick={() => {
                  setSaveError('');
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '', username: user?.username || '', email: user?.email || '',
                    phone: user?.phone || '', dob: user?.dob || '', city: user?.city || '',
                    state: user?.state || '', address: user?.address || '',
                    profileImagePreview: user?.profileImage || '', profileImageFile: null,
                  });
                }}>Cancel</button>
              </div>
            </div>
          ) : null}

          <div className="profile-vouchers">
            <h3>Your Vouchers</h3>
            {user.vouchers && user.vouchers.length > 0 ? (
              <ul>
                {user.vouchers.map((v) => (
                  <li key={v.id} className="voucher-row">
                    <div>
                      <strong>{v.type === 'percent' ? `${v.percent}% off` : v.type}</strong>
                      <div className="voucher-meta">Cap: ₹{v.cap} • Issued: {v.issuedAt ? new Date(v.issuedAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <div className={`voucher-status ${v.redeemed ? 'used' : 'active'}`}>{v.redeemed ? 'Redeemed' : 'Available'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No vouchers available.</p>
            )}
          </div>

          <div className="profile-bookings">
            <h3>Your Bookings</h3>
            {user.bookings && user.bookings.length > 0 ? (
              <ul>
                {user.bookings.map((b) => (
                  <li key={b.id} className="booking-row">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {b.photos && b.photos[0] ? <img src={b.photos[0]} alt="bk-photo" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }} /> : <img src={b.movie.img || '/assets/movie-placeholder.png'} alt="poster" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }} />}
                      <div>
                        <strong>{b.movie?.title || 'Movie'}</strong>
                        <div className="voucher-meta">Seats: {b.seats.join(', ')} • ₹{b.amount}</div>
                        <div className="voucher-meta">{b.showTime ? new Date(b.showTime).toLocaleString() : (b.createdAt ? new Date(b.createdAt).toLocaleString() : '')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="signup-btn" onClick={() => navigate('/ticket', { state: { movie: b.movie, selectedSeats: b.seats, totalAmount: b.amount, showTime: b.showTime, screen: b.screen, photos: b.photos, bookingId: b.id } })}>View / Print</button>
                      <button type="button" className="logout-btn-full" onClick={async () => {
                        if (!confirm('Cancel this booking and release seats?')) return;
                        try {
                          // free seats in reservations
                          await unbookSeats({ movieKey: b.movieKey, seats: b.seats });
                        } catch (err) {
                          // continue
                        }
                        // remove booking from user profile
                        const remaining = (user.bookings || []).filter((bb) => bb.id !== b.id);
                        updateProfile({ bookings: remaining });
                      }}>Cancel</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bookings yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;