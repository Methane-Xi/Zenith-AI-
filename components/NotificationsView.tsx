
import React, { useMemo, useState, useEffect } from 'react';
import { useTaskStore } from '../store';
import { Bell, Sparkles, AlertCircle, CheckCircle, Info, Clock, Trash2, ShieldAlert, Activity, Cpu, Database, Zap } from 'lucide-react';

const NotificationsView: React.FC = () => {
  const { tasks } = useTaskStore();
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'security'>('all');

  const alerts = useMemo(() => {
    const list: Array<{ id: string; type: 'ai' | 'reminder' | 'system' | 'security'; title: string; message: string; time: number }> = [];
    
    // Default System Pulse
    list.push({
      id: 'sys-pulse',
      type: 'system',
      title: 'Neural Engine Stabilized',
      message: 'Productivity weights synchronized across 4 acquisition domains. Biometric heartbeat verified.',
      time: Date.now() - 3600000
    });

    // Simulated Hardware Notification
    list.push({
      id: 'sec-hal',
      type: 'security',
      title: 'HAL Probe Completed',
      message: 'Optical and Acoustic sensors initialized. Secure Enclave sealed at root level.',
      time: Date.now() - 15 * 60 * 1000
    });

    tasks.forEach(task => {
      // AI Alerts
      if (task.suggestions.some(s => s.status === 'pending')) {
        list.push({
          id: `ai-${task.id}`,
          type: 'ai',
          title: 'AI Optimization Ready',
          message: `New logic paths available for "${task.title}". Review suggested milestones.`,
          time: task.updatedAt
        });
      }
      // Reminders
      task.reminders.forEach(r => {
        list.push({
          id: r.id,
          type: 'reminder',
          title: 'Contextual Nudge',
          message: `Scheduled event for "${task.title}": ${r.message || 'Verification required.'}`,
          time: new Date(r.time).getTime()
        });
      });
    });

    return list
      .filter(a => !clearedIds.includes(a.id))
      .filter(a => activeTab === 'all' || a.type === activeTab || (activeTab === 'security' && a.type === 'system'))
      .sort((a, b) => b.time - a.time);
  }, [tasks, clearedIds, activeTab]);

  const dismiss = (id: string) => setClearedIds(prev => [...prev, id]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Signal Feed</h1>
            <p className="text-slate-500 font-medium">Real-time pulses from your productivity engine.</p>
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
             <TabBtn active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="All" />
             <TabBtn active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Logic" />
             <TabBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} label="System" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           <StatusMetric label="Sync Status" value="Online" icon={<Zap size={14} />} color="text-green-500" />
           <StatusMetric label="Data Sealed" value="842.1 GB" icon={<Database size={14} />} color="text-blue-500" />
           <StatusMetric label="Auth Level" value="Level 4" icon={<ShieldAlert size={14} />} color="text-indigo-500" />
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Clear signals</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">No pending alerts or neural updates at the moment.</p>
            <button 
              onClick={() => setClearedIds([])}
              className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Reset Signal Feed
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`group p-6 rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all flex items-start space-x-5 border-l-4 animate-in fade-in slide-in-from-left-2 duration-300 ${
                  alert.type === 'ai' ? 'border-l-purple-500' : 
                  alert.type === 'reminder' ? 'border-l-indigo-500' : 
                  alert.type === 'security' ? 'border-l-red-500' : 'border-l-slate-400'
                }`}
              >
                <div className={`p-3 rounded-xl shrink-0 ${
                  alert.type === 'ai' ? 'bg-purple-50 text-purple-600' : 
                  alert.type === 'reminder' ? 'bg-indigo-50 text-indigo-600' : 
                  alert.type === 'security' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {alert.type === 'ai' ? <Sparkles size={22} /> : 
                   alert.type === 'reminder' ? <Bell size={22} /> : 
                   alert.type === 'security' ? <ShieldAlert size={22} /> : <Activity size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-base font-bold text-slate-900 tracking-tight">{alert.title}</h4>
                    <div className="flex items-center space-x-3">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       <button onClick={() => dismiss(alert.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{alert.message}</p>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => dismiss(alert.id)} className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-slate-600 rounded-lg transition-all uppercase tracking-[0.1em]">Dismiss Signal</button>
                    {alert.type === 'ai' && (
                      <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black text-white rounded-lg shadow-md shadow-indigo-100 transition-all uppercase tracking-[0.1em]">Review Logic</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);

const StatusMetric = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
     <div className="flex items-center space-x-3">
        <div className={`p-2 bg-slate-50 rounded-lg ${color}`}>{icon}</div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
     </div>
     <span className={`text-xs font-bold ${color}`}>{value}</span>
  </div>
);

export default NotificationsView;
