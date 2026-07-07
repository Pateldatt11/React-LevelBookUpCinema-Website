/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider, microsoftProvider, githubProvider } from '../firebase';

export const AuthContext = createContext();

const COOKIE_NAME = 'levelbookup_user';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ---------- Cookie helpers (used only for fast local caching of the user profile) ----------
const readCookie = (name) => {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  if (!match) return null;

  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
};

const writeCookie = (name, value, maxAge = COOKIE_MAX_AGE) => {
  if (typeof document === 'undefined') return;
  // Cookies have a hard ~4KB limit. If the payload is too big, skip writing
  // instead of silently corrupting/truncating it. Firestore stays the source of truth.
  if (value.length > 3800) {
    console.warn('Skipping cookie cache: payload too large for a cookie.');
    return;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const removeCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const getCachedUser = () => {
  const cookieUser = readCookie(COOKIE_NAME);
  if (!cookieUser) return null;
  try {
    return JSON.parse(cookieUser);
  } catch {
    return null;
  }
};

// ---------- Firebase error messages ----------
const mapFirebaseError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'This email is already registered.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/popup-closed-by-user': return 'Sign in was cancelled.';
    default: return 'Something went wrong. Please try again.';
  }
};

export const AuthProvider = ({ children }) => {
  // Start with cached cookie user so UI doesn't flicker before Firebase resolves
  const [user, setUser] = useState(() => getCachedUser());
  const [loading, setLoading] = useState(true);

  // Keep Firebase auth state, Firestore profile, and cookie cache all in sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        const profile = docSnap.exists() ? docSnap.data() : {};
        const fullUser = { uid: firebaseUser.uid, email: firebaseUser.email, ...profile };
        setUser(fullUser);
        writeCookie(COOKIE_NAME, JSON.stringify(fullUser));
      } else {
        setUser(null);
        removeCookie(COOKIE_NAME);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const saveUserData = async (uid, data) => {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  };

  // Uploads a File object to Firebase Storage and returns its public download URL.
  // This is the ONLY place image bytes go now — never into Firestore, never into a cookie.
  const uploadProfileImage = async (uid, file) => {
    const imageRef = ref(storage, `profileImages/${uid}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const login = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, message: mapFirebaseError(error.code) };
    }
  };

  const register = async (userData) => {
    try {
      const { email, password, name, username, phone, dob, city, state, address, profileImageFile } = userData;
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await updateFirebaseProfile(cred.user, { displayName: name });

      let profileImage = '';
      if (profileImageFile) {
        profileImage = await uploadProfileImage(cred.user.uid, profileImageFile);
      }

      const voucher = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'percent',
        percent: 15,
        cap: 500,
        redeemed: false,
        issuedAt: Date.now(),
      };

      const profileData = {
        name, username, email,
        phone: phone || '',
        dob: dob || '',
        city: city || '',
        state: state || '',
        address: address || '',
        profileImage,
        joinedAt: Date.now(),
        vouchers: [voucher],
        provider: 'password',
      };

      await saveUserData(cred.user.uid, profileData);
      return { success: true };
    } catch (error) {
      return { success: false, message: mapFirebaseError(error.code) };
    }
  };

  const registerWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;

      const existing = await getDoc(doc(db, 'users', u.uid));
      if (!existing.exists()) {
        const voucher = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'percent',
          percent: 15,
          cap: 500,
          redeemed: false,
          issuedAt: Date.now(),
        };

        await saveUserData(u.uid, {
          name: u.displayName || '',
          username: u.email ? u.email.split('@')[0] : '',
          email: u.email,
          profileImage: u.photoURL || '',
          joinedAt: Date.now(),
          vouchers: [voucher],
          provider: 'google',
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: mapFirebaseError(error.code) };
    }
  };

  const registerWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const u = result.user;

      const existing = await getDoc(doc(db, 'users', u.uid));
      if (!existing.exists()) {
        const voucher = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'percent',
          percent: 15,
          cap: 500,
          redeemed: false,
          issuedAt: Date.now(),
        };

        await saveUserData(u.uid, {
          name: u.displayName || '',
          username: u.email ? u.email.split('@')[0] : (u.reloadUserInfo?.screenName || ''),
          email: u.email || '',
          profileImage: u.photoURL || '',
          joinedAt: Date.now(),
          vouchers: [voucher],
          provider: 'github',
        });
      }

      return { success: true };
    } catch (error) {
      // GitHub accounts without a public email will throw auth/account-exists-with-different-credential
      // if the same email is already registered via another provider. Surface a clearer message.
      if (error.code === 'auth/account-exists-with-different-credential') {
        return { success: false, message: 'An account with this email already exists using a different sign-in method.' };
      }
      return { success: false, message: mapFirebaseError(error.code) };
    }
  };

  const registerWithMicrosoft = async () => {
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const u = result.user;

      const existing = await getDoc(doc(db, 'users', u.uid));
      if (!existing.exists()) {
        const voucher = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'percent',
          percent: 15,
          cap: 500,
          redeemed: false,
          issuedAt: Date.now(),
        };

        await saveUserData(u.uid, {
          name: u.displayName || '',
          username: u.email ? u.email.split('@')[0] : '',
          email: u.email || '',
          profileImage: u.photoURL || '',
          joinedAt: Date.now(),
          vouchers: [voucher],
          provider: 'microsoft',
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: mapFirebaseError(error.code) };
    }
  };

  const logout = async () => {
    await signOut(auth);
    removeCookie(COOKIE_NAME);
    setUser(null);
  };

  const redeemVoucher = async (voucherId) => {
    if (!user?.uid) return;
    const updatedVouchers = (user.vouchers || []).map((v) =>
      v.id === voucherId ? { ...v, redeemed: true, redeemedAt: Date.now() } : v
    );
    await updateDoc(doc(db, 'users', user.uid), { vouchers: updatedVouchers });
    const updatedUser = { ...user, vouchers: updatedVouchers };
    setUser(updatedUser);
    writeCookie(COOKIE_NAME, JSON.stringify(updatedUser));
  };

  // updates can include a `profileImageFile` (a File object from an <input type="file">).
  // If present, it's uploaded to Storage first and only the resulting URL is saved
  // to Firestore/cookie — never the raw base64 bytes.
  // Returns { success, message } instead of throwing, so the UI can react properly.
  const updateProfile = async (updates) => {
    if (!user?.uid) return { success: false, message: 'You are not logged in.' };

    try {
      const { profileImageFile, ...rest } = updates;
      const finalUpdates = { ...rest };

      if (profileImageFile) {
        finalUpdates.profileImage = await uploadProfileImage(user.uid, profileImageFile);
      }

      await updateDoc(doc(db, 'users', user.uid), finalUpdates);

      const updatedUser = { ...user, ...finalUpdates };
      setUser(updatedUser);
      writeCookie(COOKIE_NAME, JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('updateProfile failed:', error);
      return { success: false, message: 'Could not save profile. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        registerWithGoogle,
        registerWithMicrosoft,
        registerWithGithub,
        logout,
        redeemVoucher,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};