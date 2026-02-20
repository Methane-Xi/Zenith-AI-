export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AcquisitionState {
  IDLE = 'IDLE',
  PERMISSION_REQUESTED = 'PERMISSION_REQUESTED',
  HARDWARE_READY = 'HARDWARE_READY',
  SIGNAL_PRESENT = 'SIGNAL_PRESENT',
  DATA_STREAMING = 'DATA_STREAMING',
  FEATURE_EXTRACTION = 'FEATURE_EXTRACTION',
  LIVENESS_VERIFIED = 'LIVENESS_VERIFIED',
  QUALITY_THRESHOLD_MET = 'QUALITY_THRESHOLD_MET',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  HARDWARE_UNSUPPORTED = 'HARDWARE_UNSUPPORTED'
}

export interface BiometricTelemetry {
  quality: number;
  fps: number;
  resolution: string;
  latency: number;
  signalStrength: number;
}

export interface MLProfile {
  averageCompletionTime: number;
  commonCategories: string[];
  productivityScore: number;
  riskPattern: 'stable' | 'volatile' | 'improving';
}

export interface AIPreferences {
  summaryStyle: 'simple' | 'detailed' | 'bullet';
  languageLevel: 'basic' | 'intermediate' | 'advanced';
  enableMLPrediction: boolean;
  autoGenerateSummary: boolean;
}

export interface User {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  createdAt: number;
  lastLogin: number;
  isVerified: boolean;
  aiPreferences: AIPreferences;
  mlProfile: MLProfile;
  usageStats: {
    totalTasksCreated: number;
    totalTasksCompleted: number;
    totalAIRequests: number;
  };
  biometricConfidence: number;
}

export interface AISummary {
  standardSummary: string;
  simplifiedSummary: string;
  bulletSummary: string[];
  readabilityScore: number;
}

export interface MLPrediction {
  predictedCompletionTime: string;
  riskScore: number;
  suggestedPriority: TaskPriority;
  autoCategory: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AISuggestion {
  id: string;
  field: 'duration' | 'category' | 'priority' | 'deadline' | 'subtasks';
  value: string;
  reasoning: string;
  status: 'pending' | 'accepted' | 'rejected';
  metadata?: any;
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export interface Reminder {
  id: string;
  time: string;
  type: 'push' | 'email' | 'sms' | 'app';
  triggered: boolean;
  message: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number; // Keep as number for legacy but map to TaskPriority in UI
  priorityLevel: TaskPriority;
  subtasks: Subtask[];
  notes: Note[];
  reminders: Reminder[];
  suggestions: AISuggestion[];
  aiSummary?: AISummary;
  mlPrediction?: MLPrediction;
  createdAt: number;
  updatedAt: number;
  category?: string;
  duration?: string;
  deadline?: string;
  energyLevel?: number;
  tags: string[];
  isArchived: boolean;
}

export type ActivePanel = 'dashboard' | 'calendar' | 'notifications' | 'settings' | 'admin';

export interface UserSettings {
  aiAssistance: boolean;
  aiReasoningVisible: boolean;
  aiFrequency: 'realtime' | 'daily' | 'never';
  aiTone: 'friendly' | 'professional' | 'minimal';
  notifications: boolean;
  reminderType: 'push' | 'email' | 'sms' | 'app';
  reminderSound: string;
  notificationStyle: 'banner' | 'modal' | 'toast';
  snoozeDuration: number;
  aiSuggestedReminders: boolean;
  defaultDuration: string;
  autoPriority: boolean;
  defaultCategory: string;
  richTextEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  layoutDensity: 'compact' | 'spacious';
  showUpcomingWidget: boolean;
  showAiWidget: boolean;
  biometricEnforcement: 'low' | 'high' | 'paranoid';
}