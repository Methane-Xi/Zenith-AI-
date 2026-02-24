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
import { User, AIPreferences, MLProfile, UserSettings } from '../types';

const DEFAULT_AI_PREFS: AIPreferences = {
  summaryStyle: 'simple',
  languageLevel: 'basic',
  enableMLPrediction: true,
  autoGenerateSummary: true,
  aiAggressiveness: 3
};

const DEFAULT_ML_PROFILE: MLProfile = {
  completionRate: 0,
  averageDuration: 0,
  delayFrequency: 0,
  productivityScore: 0,
  riskPattern: 'stable'
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  aiSummaryMode: 'standard',
  aiAggressiveness: 3,
  voiceEnabled: false,
  autoCarryForward: true,
  notificationsEnabled: true,
  mlEnabled: true,
  aiAssistance: true,
  aiReasoningVisible: true,
  aiFrequency: 'realtime',
  aiTone: 'professional',
  reminderType: 'app',
  reminderSound: 'default',
  notificationStyle: 'toast',
  snoozeDuration: 10,
  aiSuggestedReminders: true,
  defaultDuration: '30m',
  autoPriority: true,
  defaultCategory: 'General',
  richTextEnabled: true,
  layoutDensity: 'compact',
  showUpcomingWidget: true,
  showAiWidget: true,
  biometricEnforcement: 'low',
  autoRescheduleEnabled: false,
  crossDeviceSyncEnabled: true,
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
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Provide a fallback user immediately so UI can render
        const fallback = this._generateFallbackUser(firebaseUser);
        callback(fallback);
        
        // Sync in background - the store's onSnapshot will handle real-time updates
        this._syncUserProfile(firebaseUser).then(user => {
          callback(user);
        }).catch(error => {
          console.error("Background sync failed, using fallback:", error);
        });
      } else {
        callback(null);
      }
    });
  },

  _generateFallbackUser(firebaseUser: FirebaseUser): User {
    return {
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
      settings: DEFAULT_SETTINGS,
      usageStats: {
        totalTasksCreated: 0,
        totalTasksCompleted: 0,
        totalAIRequests: 0
      },
      biometricConfidence: 0,
      status: 'active'
    };
  },

  async _syncUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        // Update last login in background
        updateDoc(userRef, { lastLogin: Date.now() }).catch(() => {});
        return data as User;
      } else {
        const newUser = this._generateFallbackUser(firebaseUser);
        await setDoc(userRef, newUser);
        return newUser;
      }
    } catch (e) {
      // Re-throw to be caught by onAuthChange
      throw e;
    }
  }
};