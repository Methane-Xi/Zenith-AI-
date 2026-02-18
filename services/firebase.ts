import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

/**
 * Zenith AI - Firebase Production Configuration
 * 
 * INTEGRATION NOTE: If you encounter 'auth/unauthorized-domain', 
 * you MUST add the hostname displayed in the console to:
 * Firebase Console > Authentication > Settings > Authorized Domains
 */
const firebaseConfig = {
  apiKey: "AIzaSyCEoiFB1xvpCMnfrr0SNY-G_uAkTsmpXX8",
  authDomain: "zenith-ai-dd404.firebaseapp.com",
  databaseURL: "https://zenith-ai-dd404-default-rtdb.firebaseio.com",
  projectId: "zenith-ai-dd404",
  storageBucket: "zenith-ai-dd404.firebasestorage.app",
  messagingSenderId: "843024782224",
  appId: "1:843024782224:web:3b9f717ea9241c851a1915",
  measurementId: "G-KBG9G8VNDW"
};

// Initialize Firebase Core
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Configure Auth Provider
export const googleProvider = new GoogleAuthProvider();

// ARCHITECTURE GOVERNANCE: Force account selection (fixes sticky login and hardcoded email bugs)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
