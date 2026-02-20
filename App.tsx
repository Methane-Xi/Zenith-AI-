import React, { useMemo } from 'react';
import Layout from './components/Layout';
import TaskInput from './components/TaskInput';
import TaskCard from './components/TaskCard';
import DetailPanel from './components/DetailPanel';
import AuthScreen from './components/Auth/AuthScreen';
import CalendarView from './components/CalendarView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import DashboardBriefing from './components/DashboardBriefing';
import TaskModal from './components/TaskModal';
import { TaskProvider, useTaskStore } from './store';
import { TaskStatus, TaskPriority } from './types';
import { Layers, Zap, Sparkles, ShieldAlert } from 'lucide-react';

/**
 * CORE METRIC VISUALIZATION
 */
const MetricCard = ({ label, value, icon, color }: { label: string, value: number | string, icon: React.ReactNode, color: string }) => (
  <div className="glass p-5 rounded-[2rem] flex flex-col justify-between h-32">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
      <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>{icon}</div>
    </div>
    <span className="text-2xl font-black text-white">{value}</span>
  </div>
);

const DashboardContent: React.FC = () => {
  const { tasks } = useTaskStore();

  const groupedTasks = useMemo(() => {
    return {
      active: tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.ARCHIVED),
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED),
    };
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = groupedTasks.completed.length;
    const active = groupedTasks.active.length;
    const criticalRisk = groupedTasks.active.filter(t => t.priorityLevel === TaskPriority.CRITICAL || t.priorityLevel === TaskPriority.HIGH).length;
    return { 
      total, 
      completed, 
      active, 
      criticalRisk, 
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0 
    };
  }, [tasks, groupedTasks]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden telemetry-grid">
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TaskInput />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          <DashboardBriefing />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
             <MetricCard label="Tactical Units" value={stats.active} icon={<Layers size={14} />} color="text-indigo-400" />
             <MetricCard label="Critical Risk" value={stats.criticalRisk} icon={<Zap size={14} />} color="text-red-400" />
             <MetricCard label="Sealed Success" value={stats.completed} icon={<Sparkles size={14} />} color="text-emerald-400" />
             <div className="glass p-5 rounded-[2rem] flex flex-col justify-between h-32">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Enclave Status</span>
                <div className="flex items-end justify-between">
                   <span className="text-2xl font-black text-white">{stats.percentage}%</span>
                   <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-emerald-500" style={{ width: `${stats.percentage}%` }}></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             {groupedTasks.active.map(task => (
               <TaskCard key={task.id} task={task} />
             ))}
             {groupedTasks.active.length === 0 && (
               <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No active tactical objectives identified</p>
               </div>
             )}
          </div>
        </div>
      </div>
      <DetailPanel />
    </div>
  );
};

const AdminPanel: React.FC = () => (
  <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
      <ShieldAlert size={40} />
    </div>
    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Admin Enclave</h2>
    <p className="text-slate-400 max-w-md">Access restricted. System-wide telemetry and operator governance modules are initializing.</p>
  </div>
);

const AppInternal: React.FC = () => {
  const { user, activePanel, isLoading } = useTaskStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Establishing Neural Link</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <Layout>
      {activePanel === 'dashboard' && <DashboardContent />}
      {activePanel === 'calendar' && <CalendarView />}
      {activePanel === 'notifications' && <NotificationsView />}
      {activePanel === 'settings' && <SettingsView />}
      {activePanel === 'admin' && <AdminPanel />}
      <TaskModal />
    </Layout>
  );
};

const App: React.FC = () => (
  <TaskProvider>
    <AppInternal />
  </TaskProvider>
);

export default App;