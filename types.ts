export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export type PriorityValue = number;

export enum AcquisitionState {
  IDLE = 'IDLE',
  PERMISSION_REQUESTED = 'PERMISSION_REQUESTED',
  HARDWARE_READY = 'HARDWARE_READY',
  DATA_STREAMING = 'DATA_STREAMING',
  FEATURE_EXTRACTION = 'FEATURE_EXTRACTION',
  LIVENESS_VERIFIED = 'LIVENESS_VERIFIED',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  googleId?: string;
  createdAt: number;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

export interface UserSettings {
  // AI & Intelligence
  aiAssistance: boolean;
  aiReasoningVisible: boolean;
  aiFrequency: 'realtime' | 'daily' | 'never';
  aiTone: 'friendly' | 'professional' | 'minimal';
  
  // Notifications & Reminders
  notifications: boolean;
  reminderType: 'push' | 'email' | 'sms' | 'app';
  reminderSound: string;
  notificationStyle: 'banner' | 'modal' | 'toast';
  snoozeDuration: number;
  aiSuggestedReminders: boolean;

  // Task Management
  defaultDuration: string;
  autoPriority: boolean;
  defaultCategory: string;
  richTextEnabled: boolean;

  // Display & Appearance
  theme: 'light' | 'dark' | 'system';
  layoutDensity: 'compact' | 'spacious';
  showUpcomingWidget: boolean;
  showAiWidget: boolean;
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
  type: 'push' | 'email';
  triggered: boolean;
  message: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: PriorityValue;
  subtasks: Subtask[];
  notes: Note[];
  reminders: Reminder[];
  suggestions: AISuggestion[];
  createdAt: number;
  updatedAt: number;
  