import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { User, AIPreferences, MLProfile } from '../types';

const DEFAULT_AI_PREFS: AIPreferences = {
  summaryStyle: 'simple',
  languageLevel: 'basic',
  enableMLPrediction: true,
  autoGenerateSummary: true
};

const DEFAULT_ML_PROFILE: MLProfile = {
  averageCompletionTime: 0,
  commonCategories: [],
  productivityScore: 0,
  riskPattern: 'stable'
};

export const authService = {
  async loginWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    return await this._syncUserProfile(result.user);
  },

  async signUpWithEmail(email: string, pass: string, name: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    await sendEmailVerification(result.user);
    return await this._syncUserProfile(result.user);
  },

  async loginWithEmail(email: string, pass: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return await this._syncUserProfile(result.user);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  setupRecaptcha(containerId: string) {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible'
      });
    }
  },

  async sendOtp(phone: string): Promise<ConfirmationResult> {
    const verifier = (window as any).recaptchaVerifier;
    if (!verifier) throw new Error("RECAPTCHA_NOT_INITIALIZED");
    return await signInWithPhoneNumber(auth, phone, verifier);
  },

  async verifyOtp(confirmation: ConfirmationResult, code: string): Promise<User> {
    const result = await confirmation.confirm(code);
    return await this._syncUserProfile(result.user);
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this._syncUserProfile(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  async _syncUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update last login
      await updateDoc(userRef, { lastLogin: Date.now() });
      return userSnap.data() as User;
    } else {
      // Create new profile
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        displayName: firebaseUser.displayName || 'Zenith Operator',
        photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
        phoneNumber: firebaseUser.phoneNumber || undefined,
        role: 'user',
        createdAt: Date.now(),
        lastLogin: Date.now(),
        isVerified: firebaseUser.emailVerified,
        aiPreferences: DEFAULT_AI_PREFS,
        mlProfile: DEFAULT_ML_PROFILE,
        usageStats: {
          totalTasksCreated: 0,
          totalTasksCompleted: 0,
          totalAIRequests: 0
        },
        biometricConfidence: 0
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
  }
};