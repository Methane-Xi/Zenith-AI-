import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

/**
 * ZENITH PRODUCTION FIREBASE SERVICE
 * Validates environment and initializes security layers with offline support.
 */

const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    console.warn(`Environment variable ${name} is missing.`);
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

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

let app: FirebaseApp;
let db: Firestore;

if (isConfigValid) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Firestore with persistent cache for offline support
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });

    // Initialize App Check for deployment
    if (typeof window !== 'undefined') {
      if (import.meta.env.DEV || window.location.hostname.includes('run.app')) {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = '007E9A6E-9314-4087-A470-3A113D300AFC';
      }
      
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(getEnvVar("VITE_RECAPTCHA_SITE_KEY") || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'),
        isTokenAutoRefreshEnabled: true
      });
    }
  } catch (error) {
    console.error("Firebase Handshake Failure");
    throw new Error("FIREBASE_INIT_FAILED");
  }
} else {
  console.error("CRITICAL: Firebase configuration is incomplete.");
  app = {} as FirebaseApp;
  db = {} as Firestore;
}

export const auth: Auth = isConfigValid ? getAuth(app) : {} as Auth;
export { db };
export const analytics: Analytics | null = isConfigValid && typeof window !== 'undefined' && firebaseConfig.measurementId 
  ? getAnalytics(app) 
  : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;