import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { User, Session } from '../types';

export const authService = {
  /**
   * Google Login/Sign-up
   */
  async loginWithGoogle(): Promise<Session> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return this._mapFirebaseUserToSession(result.user);
    } catch (error: any) {
      console.error("Auth Error:", error.code);
      throw error;
    }
  },

  /**
   * Email/Password Sign-up
   */
  async signUpWithEmail(email: string, pass: string, name: string): Promise<Session> {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    return this._mapFirebaseUserToSession(result.user);
  },

  /**
   * Email/Password Login
   */
  async loginWithEmail(email: string, pass: string): Promise<Session> {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return this._mapFirebaseUserToSession(result.user);
  },

  /**
   * Phone Number Authentication
   */
  setupRecaptcha(containerId: string) {
    if ((window as any).recaptchaVerifier) return;
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible'
    });
  },

  async sendOtp(phone: string): Promise<ConfirmationResult> {
    const verifier = (window as any).recaptchaVerifier;
    return await signInWithPhoneNumber(auth, phone, verifier);
  },

  async verifyOtp(confirmation: ConfirmationResult, code: string): Promise<Session> {
    const result = await confirmation.confirm(code);
    return this._mapFirebaseUserToSession(result.user);
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(this._mapFirebaseUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  },

  _mapFirebaseUser(firebaseUser: any): User {
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Zenith Operator',
      email: firebaseUser.email || undefined,
      phone: firebaseUser.phoneNumber || undefined,
      avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
      createdAt: Date.now()
    };
  },

  _mapFirebaseUserToSession(firebaseUser: any): Session {
    return {
      user: this._mapFirebaseUser(firebaseUser),
      token: "firebase_session_active",
      expiresAt: Date.now() + 3600000
    };
  }
};
