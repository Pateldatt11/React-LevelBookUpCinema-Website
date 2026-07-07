import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { GithubAuthProvider } from 'firebase/auth';


const firebaseConfig = {
 apiKey: "AIzaSyD9OK9JvRy42eqkVD3qY-t0QDZ6zmJlMLE",
  authDomain: "movies-booking-web.firebaseapp.com",
  projectId: "movies-booking-web",
  storageBucket: "movies-booking-web.firebasestorage.app",
  messagingSenderId: "928910825931",
  appId: "1:928910825931:web:6765c566e9739c72f63e4e",
  measurementId: "G-MV8JKBCV9D"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
export const storage = getStorage(app); 
export const githubProvider = new GithubAuthProvider();