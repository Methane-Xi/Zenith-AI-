import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

/**
 * ZENITH PRODUCTION FIREBASE SERVICE
 * Validates environment before initialization to prevent blank screens.
 */

const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    console.warn(`Environment variable ${name} is missing. System may degrade.`);
    return "";
  }
  return value;
};

const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY"),
  authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("VITE_FIREBASE_APP_ID"),
  measurementId: getEnvVar("VITE_FIREBASE_MEASUREMENT_ID")
};

// Validate critical keys
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

let app: FirebaseApp;

if (isConfigValid) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("Firebase Handshake Failure:", error);
    throw new Error("FIREBASE_INIT_FAILED");
  }
} else {
  console.error("CRITICAL: Firebase configuration is incomplete. Check .env file.");
  // We don't throw here to allow the app to show a custom error boundary if needed, 
  // but we must handle the 'app' being undefined in services.
  app = {} as FirebaseApp; 
}

export const auth: Auth = isConfigValid ? getAuth(app) : {} as Auth;
export const db: Firestore = isConfigValid ? getFirestore(app) : {} as Firestore;
export const analytics: Analytics | null = isConfigValid && typeof window !== 'undefined' && firebaseConfig.measurementId 
  ? getAnalytics(app) 
  : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;