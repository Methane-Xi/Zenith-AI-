
import React, { useState } from 'react';
import { useTaskStore } from '../store';
import { 
  User, Bell, Shield, Brain, Moon, Sun, Monitor, 
  Lock, Eye, Fingerprint, Mic, Zap, ChevronRight, 
  Activity, Database, Cpu, Layout, MessageSquare, 
  Volume2, Clock, Globe, Laptop, Key, History, Sparkles
} from 'lucide-react';
import { FaceAcquisitionEngine, DactylAcquisitionEngine, VoiceAcquisitionEngine } from './Engines';

type SettingsCategory = 'profile' | 'notifications' | 'ai' | 'display' | 'security' | 'advanced';

// Moving helper components to the top ensures they are defined and their types are fully resolved 
// before being used in the main SettingsView component. This resolves the TypeScript error 
// where children were not correctly associated with the Section component's props.
const CategoryItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
      active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    <span className={active ? 'text-white' : 'text-slate-400'}>{icon}</span>
    <span>{label}</span>
  </button>
);

// Fixed: Added optionality to children to satisfy TypeScript when used as a JSX wrapper.
const Section = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</h4>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const ToggleItem = ({ icon, label, description, active, onToggle }: { icon: React.ReactNode, label: string, description: string, active: boolean, onToggle: () => void }) => (
  <div onClick={onToggle} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer group">
    <div className="flex items-center space-x-4">
      <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{description}</p>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'left-7' : 'left-1'}`} />
    </div>
  </div>
);

const SelectOption = ({ label, value, onChange, options }: { label: string, value: string, onChange: (val: string) => void, options: { label: string, value: string }[] }) => (
  <div className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-200 group">
    <label className="text-sm font-bold text-slate-900">{label}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-50 border-none text-[10px] font-black text-indigo-600 p-2 rounded-xl focus:ring-0 cursor-pointer uppercase tracking-widest"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const ThemeBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all space-y-2 ${
      active ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
    }`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const InfoCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
    <div className="p-2.5 bg-slate-50 rounded-xl">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const SettingsView: React.FC = () => {
  const { user, settings, updateSettings, updateAiPreferences, logout } = useTaskStore();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('profile');

  if (!user) return null;

  return (
    <div className="flex-1 overflow-hidden bg-slate-50/50 flex flex-col md:flex-row h-full">
      {/* Settings Sub-Nav */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 overflow-y-auto p-4 flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 custom-scrollbar shrink-0">
        <CategoryItem active={activeCategory === 'profile'} onClick={() => setActiveCategory('profile')} icon={<User size={18} />} label="Account" />
        <CategoryItem active={activeCategory === 'notifications'} onClick={() => setActiveCategory('notifications')} icon={<Bell size={18} />} label="Reminders" />
        <CategoryItem active={activeCategory === 'ai'} onClick={() => setActiveCategory('ai')} icon={<Brain size={18} />} label="Intelligence" />
        <CategoryItem active={activeCategory === 'display'} onClick={() => setActiveCategory('display')} icon={<Layout size={18} />} label="Appearance" />
        <CategoryItem active={activeCategory === 'security'} onClick={() => setActiveCategory('security')} icon={<Shield size={18} />} label="Security" />
        <CategoryItem active={activeCategory === 'advanced'} onClick={() => setActiveCategory('advanced')} icon={<Zap size={18} />} label="Experimental" />
        
        <div className="hidden md:block flex-1"></div>
        
        <button 
          onClick={logout}
          className="hidden md:flex items-center space-x-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <History size={18} />
          <span>Reset Session</span>
        </button>
      </aside>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="max-w-3xl">
          {activeCategory === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <header>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Profile</h1>
                <p className="text-sm text-slate-500 font-medium">Manage how you are identified across the Zenith network.</p>
              </header>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="relative group cursor-pointer">
                  <img src={user.photoURL} alt={user.displayName} className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-white shadow-lg group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Activity className="text-white" size={24} />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900">{user.displayName}</h3>
                  <p className="text-sm text-slate-500">{user.email || user.phoneNumber || 'No identifier linked'}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-100">Role: {user.role}</span>
                    <span className="text-[10px] font-black bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-slate-100">UID: {user.uid.toUpperCase()}</span>
                    {user.isVerified && <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-emerald-100">Verified</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={<Key className="text-blue-500" />} title="Linked Accounts" value="Google Handshake Active" />
                <InfoCard icon={<History className="text-purple-500" />} title="Last Pulse" value={new Date(user.createdAt).toLocaleDateString()} />
              </div>
            </div>
          )}

          {activeCategory === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <header>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reminder Channels</h1>
                <p className="text-sm text-slate-500 font-medium">Fine-tune how and when Zenith alerts you to critical events.</p>
              </header>

              <Section label="Delivery Methods">
                <SelectOption 
                  label="Primary Alert Channel"
                  value={settings.reminderType}
                  onChange={(val) => updateSettings({ reminderType: val as any })}
                  options={[
                    { label: 'Push Notification', value: 'push' },
                    { label: 'Email Report', value: 'email' },
                    { label: 'SMS / Phone', value: 'sms' },
                    { label: 'In-App Pulse', value: 'app' }
                  ]}
                />
                <SelectOption 
                  label="Notification Visual Style"
                  value={settings.notificationStyle}
                  onChange={(val) => updateSettings({ notificationStyle: val as any })}
                  options={[
                    { label: 'System Banner', value: 'banner' },
                    { label: 'Modal Dialog', value: 'modal' },
                    { label: 'Floating Toast', value: 'toast' }
                  ]}
                />
              </Section>

              <Section label="Feedback & Audio">
                <SelectOption 
                  label="Reminder Soundscape"
                  value={settings.reminderSound}
                  onChange={(val) => updateSettings({ reminderSound: val })}
                  options={[
                    { label: 'Zenith Pulse (Default)', value: 'zenith-pulse' },
                    { label: 'Minimal Tap', value: 'tap' },
                    { label: 'Ambient Wash', value: 'ambient' },
                    { label: 'Urgent Alert', value: 'urgent' }
                  ]}
                />
                <ToggleItem 
                  icon={<Volume2 size={18} className="text-amber-500" />}
                  label="Master Notification Toggle"
                  description="Enable or disable all outgoing signals globally."
                  active={settings.notifications}
                  onToggle={() => updateSettings({ notifications: !settings.notifications })}
                />
              </Section>

              <Section label="Behavior">
                <SelectOption 
                  label="Standard Snooze Window"
                  value={settings.snoozeDuration.toString()}
                  onChange={(val) => updateSettings({ snoozeDuration: parseInt(val) })}
                  options={[
                    { label: '5 Minutes', value: '5' },
                    { label: '10 Minutes', value: '10' },
                    { label: '15 Minutes', value: '15' },
                    { label: '30 Minutes', value: '30' }
                  ]}
                />
                <ToggleItem 
                  icon={<Sparkles size={18} className="text-indigo-500" />}
                  label="AI-Suggested Reminders"
                  description="Let Zenith auto-schedule reminders based on task urgency levels."
                  active={settings.aiSuggestedReminders}
                  onToggle={() => updateSettings({ aiSuggestedReminders: !settings.aiSuggestedReminders })}
                />
              </Section>
            </div>
          )}

          {activeCategory === 'ai' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <header>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Engine</h1>
                <p className="text-sm text-slate-500 font-medium">Control the heuristic parameters of the Zenith neural engine.</p>
              </header>

              <Section label="Neural Configuration">
                <SelectOption 
                  label="Summary Style"
                  value={user.aiPreferences.summaryStyle}
                  onChange={(val) => updateAiPreferences({ summaryStyle: val as any })}
                  options={[
                    { label: 'Simple', value: 'simple' },
                    { label: 'Detailed', value: 'detailed' },
                    { label: 'Bullet', value: 'bullet' }
                  ]}
                />
                <SelectOption 
                  label="Language Level"
                  value={user.aiPreferences.languageLevel}
                  onChange={(val) => updateAiPreferences({ languageLevel: val as any })}
                  options={[
                    { label: 'Basic', value: 'basic' },
                    { label: 'Intermediate', value: 'intermediate' },
                    { label: 'Advanced', value: 'advanced' }
                  ]}
                />
                <ToggleItem 
                  icon={<Zap size={18} className="text-emerald-500" />}
                  label="ML Predictions"
                  description="Enable predictive risk and complexity scoring."
                  active={user.aiPreferences.enableMLPrediction}
                  onToggle={() => updateAiPreferences({ enableMLPrediction: !user.aiPreferences.enableMLPrediction })}
                />
                <ToggleItem 
                  icon={<Sparkles size={18} className="text-indigo-500" />}
                  label="Auto-Summarization"
                  description="Automatically generate AI summaries for new tasks."
                  active={user.aiPreferences.autoGenerateSummary}
                  onToggle={() => updateAiPreferences({ autoGenerateSummary: !user.aiPreferences.autoGenerateSummary })}
                />
              </Section>

              <Section label="Core Suggestions">
                <ToggleItem 
                  icon={<Brain size={18} className="text-purple-500" />}
                  label="Semantic Analysis"
                  description="Zenith will decompose high-level tasks into logical milestones."
                  active={settings.aiAssistance}
                  onToggle={() => updateSettings({ aiAssistance: !settings.aiAssistance })}
                />
                <ToggleItem 
                  icon={<MessageSquare size={18} className="text-blue-500" />}
                  label="Explainable Reasoning"
                  description="Show the logical foundation behind every AI suggestion."
                  active={settings.aiReasoningVisible}
                  onToggle={() => updateSettings({ aiReasoningVisible: !settings.aiReasoningVisible })}
                />
              </Section>

              <Section label="Frequency & Personality">
                <SelectOption 
                  label="Synthesis Cadence"
                  value={settings.aiFrequency}
                  onChange={(val) => updateSettings({ aiFrequency: val as any })}
                  options={[
                    { label: 'Real-time (Active)', value: 'realtime' },
                    { label: 'Daily Digest (Passive)', value: 'daily' },
                    { label: 'Manual Trigger Only', value: 'never' }
                  ]}
                />
                <SelectOption 
                  label="Agent Personality"
                  value={settings.aiTone}
                  onChange={(val) => updateSettings({ aiTone: val as any })}
                  options={[
                    { label: 'Friendly / Supportive', value: 'friendly' },
                    { label: 'Professional / Direct', value: 'professional' },
                    { label: 'Minimal / Stealth', value: 'minimal' }
                  ]}
                />
              </Section>
            </div>
          )}

          {activeCategory === 'display' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <header>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Interface Appearance</h1>
                <p className="text-sm text-slate-500 font-medium">Personalize the visual density and theme of your cockpit.</p>
              </header>

              <Section label="Theming">
                <div className="grid grid-cols-3 gap-3">
                  <ThemeBtn active={settings.theme === 'light'} onClick={() => updateSettings({ theme: 'light' })} icon={<Sun size={18} />} label="Light" />
                  <ThemeBtn active={settings.theme === 'dark'} onClick={() => updateSettings({ theme: 'dark' })} icon={<Moon size={18} />} label="Dark" />
                  <ThemeBtn active={settings.theme === 'system'} onClick={() => updateSettings({ theme: 'system' })} icon={<Laptop size={18} />} label="Auto" />
                </div>
              </Section>

              <Section label="Layout Density">
                <SelectOption 
                  label="Visual Spacing"
                  value={settings.layoutDensity}
                  onChange={(val) => updateSettings({ layoutDensity: val as any })}
                  options={[
                    { label: 'Compact (High Density)', value: 'compact' },
                    { label: 'Spacious (Standard)', value: 'spacious' }
                  ]}
                />
              </Section>

              <Section label="Dashboard Widgets">
                <ToggleItem 
                  icon={<Clock size={18} className="text-indigo-500" />}
                  label="Upcoming Timeline"
                  description="Display a preview of chronologically immediate tasks."
                  active={settings.showUpcomingWidget}
                  onToggle={() => updateSettings({ showUpcomingWidget: !settings.showUpcomingWidget })}
                />
                <ToggleItem 
                  icon={<Sparkles size={18} className="text-amber-500" />}
                  label="AI Summary Panel"
                  description="Show high-level insights on your daily productivity curve."
                  active={settings.showAiWidget}
                  onToggle={() => updateSettings({ showAiWidget: !settings.showAiWidget })}
                />
              </Section>
            </div>
          )}

          {activeCategory === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <header>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Biometric Governance</h1>
                <p className="text-sm text-slate-500 font-medium">Configure multi-modal acquisition engines for high-assurance access.</p>
              </header>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Shield size={240} className="text-white" />
                </div>
                
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Trust Level: High</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Enclave Status: Sealed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FaceAcquisitionEngine />
                  <VoiceAcquisitionEngine />
                  <div className="lg:col-span-2">
                    <DactylAcquisitionEngine />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'advanced' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <header>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Experimental (Labs)</h1>
                <p className="text-sm text-slate-500 font-medium">Access cutting-edge Zenith prototypes before they reach stable release.</p>
              </header>

              <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start space-x-4 mb-6">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Advisory: Laboratory Mode</h4>
                  <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                    The following features utilize unfinalized neural weights. System stability may vary during peak inferencing.
                  </p>
                </div>
              </div>

              <Section label="Beta Capabilities">
                <ToggleItem 
                   icon={<Activity size={18} className="text-slate-600" />}
                   label="Auto-Reschedule Engine"
                   description="Allow AI to move low-priority tasks if current energy levels drop."
                   active={false}
                   onToggle={() => {}}
                />
                <ToggleItem 
                   icon={<Globe size={18} className="text-slate-600" />}
                   label="Cross-Device Neural Sync"
                   description="Real-time session state mirroring across all authorized hubs."
                   active={true}
                   onToggle={() => {}}
                />
              </Section>

              <div className="pt-10 flex flex-col items-center">
                 <button className="flex items-center space-x-2 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-[0.3em] transition-all">
                    <Database size={12} />
                    <span>Purge Local Cache & Re-Sync</span>
                 </button>
                 <p className="text-[8px] text-slate-300 mt-4 uppercase font-black tracking-widest">Build v4.2.1-labs | Neural Seed: X921-A</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
