import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { User, Session } from '../types';

export const authService = {
  /**
   * Real Firebase Google Login
   * Implements requested syntax and diagnostic logging for domain errors.
   */
  async loginWithGoogle(): Promise<Session> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log("Logged in as:", user.email);

      const zenithUser: User = {
        id: user.uid,
        name: user.displayName || 'Zenith User',
        email: user.email || undefined,
        avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        createdAt: Date.now()
      };

      return {
        user: zenithUser,
        token: "firebase_session_active",
        expiresAt: Date.now() + 3600000
      };
    } catch (error: any) {
      // Requested Debugging Syntax
      console.error("Auth Error Code:", error.code);
      console.error("Domain to add to Firebase:", window.location.hostname);
      
      // Pass error to UI for handling
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
          name: firebaseUser.displayName || 'Zenith User',
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