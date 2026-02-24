import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './services/firebase';
import { Task, TaskStatus, TaskPriority, AISuggestion, User, ActivePanel, UserSettings, AIPreferences } from './types';
import { 
  getTaskSuggestions, 
  decomposeProject, 
  generateStrategicBriefing, 
  performTaskResearch, 
  extractTaskDetails,
  generateTaskSummaries,
} from './services/geminiService';
import { authService } from './services/authService';
import { taskDb } from './services/taskDb';
import { settingsService } from './services/settings/settingsService';
import { mlService } from './services/ml/mlService';
import { reminderService } from './services/reminder/reminderService';

interface TaskContextType {
  user: User | null;
  tasks: Task[];
  briefing: string;
  isBriefingLoading: boolean;
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  login: () => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<any>;
  verifyOtp: (confirmation: any, code: string) => Promise<void>;
  logout: () => void;
  addTask: (title: string, details?: Partial<Task>) => Promise<string>;
  explodeProject: (goal: string) => Promise<void>;
  deepResearch: (taskId: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addNote: (taskId: string, content: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  handleSuggestion: (taskId: string, suggestionId: string, accept: boolean) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateAiPreferences: (updates: Partial<AIPreferences>) => void;
  isLoading: boolean;
}

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

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [briefing, setBriefing] = useState('Establishing neural link...');
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<ActivePanel>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((u) => {
      if (!u) {
        setUser(null);
      } else {
        setUser(u as User);
      }
      // Always resolve loading state once auth status is determined
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      // Real-time user profile listener - non-blocking
      const userRef = doc(db, "users", user.uid);
      const unsubscribeUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUser(doc.data() as User);
        }
      }, (error) => {
        console.error("User Profile Sync Error:", error);
      });

      const unsubscribeTasks = taskDb.subscribeToTasks(user.uid, (syncedTasks) => {
        setTasks(syncedTasks);
      });
      
      const unsubscribeSettings = settingsService.subscribeToSettings(user.uid, (syncedSettings: UserSettings) => {
        setSettings(syncedSettings);
        settingsService.applyTheme(syncedSettings.theme);
      });

      // Scan reminders on start
      reminderService.scanAndProcessReminders(user.uid);

      return () => {
        unsubscribeUser();
        unsubscribeTasks();
        unsubscribeSettings();
      };
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user && tasks.length > 0) {
      setIsBriefingLoading(true);
      generateStrategicBriefing(tasks).then(b => {
        setBriefing(b || "Tactical roadmap clear.");
        setIsBriefingLoading(false);
      });
    }
  }, [tasks.length, user]);

  const addTask = useCallback(async (title: string, details?: Partial<Task>) => {
    if (!user) return '';
    const newId = Math.random().toString(36).substr(2, 9);
    
    // Create basic task immediately for instant UI response
    const newTask: Task = {
      id: newId,
      userId: user.uid,
      title: title,
      description: details?.description || '',
      status: TaskStatus.TODO,
      priority: details?.priority ?? 0.5,
      priorityLevel: TaskPriority.MEDIUM,
      subtasks: details?.subtasks || [],
      notes: [],
      reminders: [],
      suggestions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: details?.category || settings.defaultCategory,
      duration: details?.duration || settings.defaultDuration,
      tags: details?.tags || [],
      isArchived: false
    };

    await taskDb.saveTask(newTask);

    // Perform AI enhancements in background
    (async () => {
      try {
        const extracted = await extractTaskDetails(title);
        const updates: Partial<Task> = {
          title: extracted?.title || title,
          description: details?.description || extracted?.description || '',
          priority: details?.priority ?? extracted?.priority ?? 0.5,
          priorityLevel: extracted?.mlPrediction?.suggestedPriority || TaskPriority.MEDIUM,
          mlPrediction: extracted?.mlPrediction,
          category: details?.category || extracted?.category || settings.defaultCategory,
          duration: details?.duration || extracted?.duration || settings.defaultDuration,
        };

        if (user.aiPreferences.autoGenerateSummary) {
          const summaries = await generateTaskSummaries({ ...newTask, ...updates }, user.aiPreferences);
          if (summaries) updates.aiSummary = summaries;
        }

        await taskDb.updateTask(newId, updates);

        if (settings.aiAssistance) {
          const suggestions = await getTaskSuggestions(updates.title || title);
          const aiSuggestions: AISuggestion[] = suggestions.map((s: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            field: s.field as any,
            value: s.value || '',
            reasoning: s.reasoning || '',
            status: 'pending',
            metadata: s.metadata
          }));
          await taskDb.updateTask(newId, { suggestions: aiSuggestions });
        }
      } catch (error) {
        console.error("AI Enhancement Error:", error);
      }
    })();

    return newId;
  }, [user, settings]);

  const explodeProject = async (goal: string) => {
    if (!user) return;
    const projectTasks = await decomposeProject(goal);
    for (const pt of projectTasks) {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.uid,
        title: pt.title,
        status: TaskStatus.TODO,
        priority: pt.priority || 0.5,
        priorityLevel: TaskPriority.MEDIUM,
        subtasks: (pt.subtasks || []).map((s: string) => ({ id: Math.random().toString(36).substr(2, 9), title: s, completed: false })),
        notes: [{ id: 'init', content: pt.reasoning, createdAt: Date.now() }],
        reminders: [],
        suggestions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: pt.category,
        duration: pt.estimatedDuration,
        tags: [],
        isArchived: false
      };
      await taskDb.saveTask(newTask);
    }
  };

  const deepResearch = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const { text, links } = await performTaskResearch(task.title);
    const researchNote = {
      id: `research_${Date.now()}`,
      content: `${text}\n\nSources:\n${links.map(l => `- [${l.title}](${l.uri})`).join("\n")}`,
      createdAt: Date.now()
    };
    await taskDb.updateTask(taskId, { notes: [researchNote, ...task.notes] });
  };

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    await taskDb.updateTask(id, updates);
    
    // ML Profile update on completion
    if (user && updates.status === TaskStatus.COMPLETED) {
      const task = tasks.find(t => t.id === id);
      if (task) mlService.updateProfileOnTaskCompletion(user.uid, task);
    }
  }, [user, tasks]);

  const toggleSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
    await taskDb.updateTask(taskId, { subtasks: updatedSubtasks });
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    await taskDb.deleteTask(id);
    if (selectedTaskId === id) setSelectedTaskId(null);
  }, [selectedTaskId]);

  const addNote = useCallback(async (taskId: string, content: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const note = { id: Math.random().toString(36).substr(2, 9), content, createdAt: Date.now() };
    await taskDb.updateTask(taskId, { notes: [note, ...task.notes] });
  }, [tasks]);

  const handleSuggestion = useCallback(async (taskId: string, suggestionId: string, accept: boolean) => {
    const t = tasks.find(task => task.id === taskId);
    if (!t || !accept) {
      if (t) {
        const updated = t.suggestions.map(s => s.id === suggestionId ? { ...s, status: 'rejected' } : s);
        await taskDb.updateTask(taskId, { suggestions: updated as AISuggestion[] });
      }
      return;
    }
    const suggestion = t.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    let updates: Partial<Task> = { 
      suggestions: t.suggestions.map(s => s.id === suggestionId ? { ...s, status: 'accepted' } : s) as AISuggestion[] 
    };
    if (suggestion.field === 'duration') updates.duration = suggestion.value;
    if (suggestion.field === 'category') updates.category = suggestion.value;
    if (suggestion.field === 'priority') updates.priority = parseFloat(suggestion.value) || 0.5;
    if (suggestion.field === 'deadline') updates.deadline = suggestion.value;
    if (suggestion.field === 'subtasks' && suggestion.metadata) {
      const newSubtasks = suggestion.metadata.map((s: string) => ({ id: Math.random().toString(36).substr(2, 9), title: s, completed: false }));
      updates.subtasks = [...t.subtasks, ...newSubtasks];
    }
    await taskDb.updateTask(taskId, updates);
  }, [tasks]);

  const login = async () => { await authService.loginWithGoogle(); };
  const signUpEmail = async (email: string, pass: string, name: string) => { await authService.signUpWithEmail(email, pass, name); };
  const loginEmail = async (email: string, pass: string) => { await authService.loginWithEmail(email, pass); };
  const sendOtp = async (phone: string) => authService.sendOtp(phone);
  const verifyOtp = async (confirmation: any, code: string) => { await authService.verifyOtp(confirmation, code); };
  const logout = async () => authService.logout();

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;
    // Optimistic update
    const previousSettings = { ...settings };
    setSettings(prev => ({ ...prev, ...updates }));
    if (updates.theme) settingsService.applyTheme(updates.theme);

    try {
      await settingsService.updateSettings(user.uid, updates);
    } catch (error) {
      console.error("Failed to sync settings:", error);
      setSettings(previousSettings);
      if (previousSettings.theme) settingsService.applyTheme(previousSettings.theme);
    }
  };
  
  const updateAiPreferences = async (updates: Partial<AIPreferences>) => {
    if (!user) return;
    // Optimistic update
    const previousPrefs = { ...user.aiPreferences };
    const newPrefs = { ...user.aiPreferences, ...updates };
    setUser(prev => prev ? { ...prev, aiPreferences: newPrefs } : null);

    try {
      await taskDb.updateUser(user.uid, { aiPreferences: newPrefs });
    } catch (error) {
      console.error("Failed to sync AI preferences:", error);
      setUser(prev => prev ? { ...prev, aiPreferences: previousPrefs } : null);
    }
  };

  return React.createElement(TaskContext.Provider, { 
    value: { 
      user, tasks, briefing, isBriefingLoading, isLoading, activePanel, setActivePanel, login, 
      signUpEmail, loginEmail, sendOtp, verifyOtp, logout, 
      addTask, explodeProject, deepResearch, updateTask, deleteTask, addNote, toggleSubtask, handleSuggestion, 
      selectedTaskId, setSelectedTaskId, isTaskModalOpen, setIsTaskModalOpen,
      searchQuery, setSearchQuery,
      settings, updateSettings, updateAiPreferences
    } 
  }, children);
};

export const useTaskStore = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTaskStore error");
  return context;
};