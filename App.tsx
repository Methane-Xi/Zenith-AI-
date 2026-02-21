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
import { TaskStatus, TaskPriority, User } from './types';
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

const AdminPanel: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user: currentUser } = useTaskStore();

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const { adminService } = await import('./services/adminService');
      const [systemStats, allUsers] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getAllUsers()
      ]);
      setStats(systemStats);
      setUsers(allUsers);
    } catch (error) {
      console.error("Admin Access Denied or Sync Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    if (userId === currentUser?.uid) return; // Prevent self-demotion
    const { adminService } = await import('./services/adminService');
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await adminService.updateUserRole(userId, newRole);
    loadAdminData(); // Refresh
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Governance Enclave</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">System-wide operator governance and telemetry</p>
        </div>
        <button onClick={loadAdminData} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
          <Zap size={20} />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Total Operators" value={stats?.totalUsers || 0} icon={<ShieldAlert size={14} />} color="text-red-400" />
        <MetricCard label="Active Tasks" value={stats?.totalTasks || 0} icon={<Layers size={14} />} color="text-indigo-400" />
        <div className="glass p-5 rounded-[2rem] flex flex-col justify-between h-32">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">System Integrity</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-black text-emerald-400">{stats?.systemHealth}</span>
          </div>
        </div>
      </div>

      {/* User Management */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Operator Directory</h3>
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Operator</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={u.photoURL} alt="" className="w-8 h-8 rounded-lg bg-white/5" />
                      <div>
                        <p className="text-xs font-bold text-white">{u.displayName}</p>
                        <p className="text-[10px] text-slate-500">{u.email || u.phoneNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                      {u.isVerified ? 'Verified' : 'Unlinked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleRoleToggle(u.uid, u.role)}
                      disabled={u.uid === currentUser?.uid}
                      className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest disabled:opacity-20"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

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