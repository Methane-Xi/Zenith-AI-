import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { UserSettings } from '../../types';

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

export const settingsService = {
  async getSettings(userId: string): Promise<UserSettings> {
    try {
      const settingsRef = doc(db, 'users', userId, 'config', 'settings');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        return { ...DEFAULT_SETTINGS, ...settingsSnap.data() } as UserSettings;
      } else {
        await setDoc(settingsRef, DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, 'users', userId, 'config', 'settings');
      await updateDoc(settingsRef, settings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },

  subscribeToSettings(userId: string, callback: (settings: UserSettings) => void) {
    const settingsRef = doc(db, 'users', userId, 'config', 'settings');
    return onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        callback({ ...DEFAULT_SETTINGS, ...doc.data() } as UserSettings);
      }
    });
  },

  applyTheme(theme: 'light' | 'dark' | 'system') {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    
    // Also update body for good measure
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(isDark ? 'dark' : 'light');
  }
};
