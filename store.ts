import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, AISuggestion, User, ActivePanel, UserSettings, AIPreferences } from './types';
import { 
  getTaskSuggestions, 
  decomposeProject, 
  generateStrategicBriefing, 
  performTaskResearch, 
  extractTaskDetails,
  generateTaskSummaries,
  queryAntigravity
} from './services/geminiService';
import { authService } from './services/authService';
import { taskDb } from './services/taskDb';

interface TerminalEntry {
  role: 'user' | 'model';
  parts: { text: string }[];
}

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
  isTerminalOpen: boolean;
  setIsTerminalOpen: (open: boolean) => void;
  terminalHistory: TerminalEntry[];
  sendTerminalQuery: (q: string) => Promise<void>;
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateAiPreferences: (updates: Partial<AIPreferences>) => void;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  aiAssistance: true,
  aiReasoningVisible: true,
  aiFrequency: 'realtime',
  aiTone: 'professional',
  notifications: true,
  reminderType: 'push',
  reminderSound: 'zenith-pulse',
  notificationStyle: 'banner',
  snoozeDuration: 10,
  aiSuggestedReminders: true,
  defaultDuration: '1h',
  autoPriority: true,
  defaultCategory: 'General',
  richTextEnabled: true,
  theme: 'dark',
  layoutDensity: 'spacious',
  showUpcomingWidget: true,
  showAiWidget: true,
  biometricEnforcement: 'high'
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
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = taskDb.subscribeToTasks(user.uid, (syncedTasks) => {
        setTasks(syncedTasks);
      });
      return () => unsubscribe();
    }
  }, [user]);

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
    
    let extracted = await extractTaskDetails(title);
    
    const newTask: Task = {
      id: newId,
      userId: user.uid,
      title: extracted?.title || title,
      description: details?.description || extracted?.description || '',
      status: TaskStatus.TODO,
      priority: details?.priority ?? extracted?.priority ?? 0.5,
      priorityLevel: extracted?.mlPrediction?.suggestedPriority || TaskPriority.MEDIUM,
      subtasks: details?.subtasks || [],
      notes: [],
      reminders: [],
      suggestions: [],
      mlPrediction: extracted?.mlPrediction,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: details?.category || extracted?.category || settings.defaultCategory,
      duration: details?.duration || extracted?.duration || settings.defaultDuration,
      tags: details?.tags || [],
      isArchived: false
    };

    // Generate AI summaries if enabled
    if (user.aiPreferences.autoGenerateSummary) {
      const summaries = await generateTaskSummaries(newTask, user.aiPreferences);
      if (summaries) newTask.aiSummary = summaries;
    }

    await taskDb.saveTask(newTask);

    if (settings.aiAssistance) {
      getTaskSuggestions(newTask.title).then(async (suggestions) => {
        const aiSuggestions: AISuggestion[] = suggestions.map((s: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          field: s.field as any,
          value: s.value || '',
          reasoning: s.reasoning || '',
          status: 'pending',
          metadata: s.metadata
        }));
        await taskDb.updateTask(newId, { suggestions: aiSuggestions });
      });
    }
    return newId;
  }, [user, settings]);

  const sendTerminalQuery = async (q: string) => {
    const newUserEntry: TerminalEntry = { role: 'user', parts: [{ text: q }] };
    setTerminalHistory(prev => [...prev, newUserEntry]);
    const responseText = await queryAntigravity(q, terminalHistory);
    const newModelEntry: TerminalEntry = { role: 'model', parts: [{ text: responseText || 'ERROR' }] };
    setTerminalHistory(prev => [...prev, newModelEntry]);
  };

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
  }, []);

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

  const updateSettings = (updates: Partial<UserSettings>) => setSettings(prev => ({ ...prev, ...updates }));
  
  const updateAiPreferences = async (updates: Partial<AIPreferences>) => {
    if (!user) return;
    const newPrefs = { ...user.aiPreferences, ...updates };
    await taskDb.updateUser(user.uid, { aiPreferences: newPrefs });
    setUser(prev => prev ? { ...prev, aiPreferences: newPrefs } : null);
  };

  return React.createElement(TaskContext.Provider, { 
    value: { 
      user, tasks, briefing, isBriefingLoading, isLoading, activePanel, setActivePanel, login, 
      signUpEmail, loginEmail, sendOtp, verifyOtp, logout, 
      addTask, explodeProject, deepResearch, updateTask, deleteTask, addNote, toggleSubtask, handleSuggestion, 
      selectedTaskId, setSelectedTaskId, isTaskModalOpen, setIsTaskModalOpen, isTerminalOpen, setIsTerminalOpen,
      terminalHistory, sendTerminalQuery, settings, updateSettings, updateAiPreferences
    } 
  }, children);
};

export const useTaskStore = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTaskStore error");
  return context;
};