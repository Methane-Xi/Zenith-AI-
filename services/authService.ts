import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { User, Session } from '../types';

export const authService = {
  /**
   * Real Firebase Google Login
   * Uses specific syntax requested to debug unauthorized domain issues.
   */
  async loginWithGoogle(): Promise<Session> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Logged in as:", result.user.email);

      const zenithUser: User = {
        id: result.user.uid,
        name: result.user.displayName || 'Zenith Operator',
        email: result.user.email || undefined,
        avatarUrl: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`,
        createdAt: Date.now()
      };

      return {
        user: zenithUser,
        token: "firebase_session_active",
        expiresAt: Date.now() + 3600000
      };
    } catch (error: any) {
      // FIX: Specific debug logs requested
      console.error("Auth Error Code:", error.code);
      console.error("Domain to add to Firebase:", window.location.hostname);
      
      // Propagate for UI handling
      throw error;
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Zenith Operator',
          email: firebaseUser.email || undefined,
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          createdAt: Date.now()
        });
      } else {
        callback(null);
      }
    });
  }
};
