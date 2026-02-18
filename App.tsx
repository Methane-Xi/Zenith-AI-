
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
import { TaskStatus } from './types';
import { Layers, ListFilter, Sparkles, Loader2, Zap, BrainCircuit } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { tasks, recalculateAllPriorities } = useTaskStore();

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
    const highPriority = groupedTasks.active.filter(t => t.priority > 0.7).length;
    return { total, completed, active, highPriority, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [tasks, groupedTasks]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-full overflow-hidden">
        <TaskInput />
        
        {/* Main scrollable container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          
          {/* Briefing is now part of the normal document flow inside scroll area */}
          <DashboardBriefing />

          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
             <StatCard label="Active Tasks" value={stats.active} icon={<Layers size={14} />} color="text-indigo-600" />
             <StatCard label="Urgent Signals" value={stats.highPriority} icon={<Zap size={14} />} color="text-red-500" />
             <StatCard label="Completed" value={stats.completed} icon={<Sparkles size={14} />} color="text-green-600" />
             <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Day Progress</span>
                <div className="flex items-end justify-between">
                   <span className="text-xl font-black text-slate-900">{stats.percentage}%</span>
                   <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${stats.percentage}%` }} />
                   </div>
                </div>
             </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                  <Zap size={18} />
                </div>
                <h2 className="font-bold text-lg tracking-tight">Focus Protocol</h2>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {groupedTasks.active.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={recalculateAllPriorities}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  <BrainCircuit size={14} />
                  <span>Calibrate</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm">
                  <ListFilter size={18} />
                </button>
              </div>
            </div>

            {groupedTasks.active.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50 backdrop-blur-sm shadow-inner">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mx-auto mb-6">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Neural Link Idle</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">Zenith AI is standing by. Use the command bar above to generate tactical roadmaps.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {groupedTasks.active.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>

          {groupedTasks.completed.length > 0 && (
            <section className="pb-8">
              <div className="flex items-center space-x-2 text-slate-400 mb-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] px-1">Sealed Tasks</h2>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                {groupedTasks.completed.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <DetailPanel />
      <TaskModal />
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
     <div className="flex items-center space-x-2 mb-2">
        <div className={`p-1.5 bg-slate-50 rounded-lg ${color}`}>{icon}</div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
     </div>
     <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const AuthenticatedApp: React.FC = () => {
  const { user, isLoading, activePanel } = useTaskStore();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white flex-col space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={56} strokeWidth={2.5} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Enclave</p>
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
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <TaskProvider>
      <AuthenticatedApp />
    </TaskProvider>
  );
};

export default App;
