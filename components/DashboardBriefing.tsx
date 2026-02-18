
import React from 'react';
import { useTaskStore } from '../store';
import { Brain, Zap, Loader2, Sparkles } from 'lucide-react';

const DashboardBriefing: React.FC = () => {
  const { briefing, isBriefingLoading, tasks } = useTaskStore();

  if (tasks.length === 0) return null;

  return (
    <div className="relative bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-2xl overflow-hidden group mb-8 animate-in slide-in-from-top duration-500">
      <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
        <Brain size={240} className="text-white" />
      </div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Zap size={20} />
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Zenith Neural Summary</h3>
        </div>
        {isBriefingLoading && <Loader2 size={16} className="animate-spin text-indigo-400" />}
      </div>

      <div className="relative">
        <p className={`text-lg md:text-xl font-bold text-white leading-relaxed tracking-tight ${isBriefingLoading ? 'opacity-50 blur-sm' : 'opacity-100'} transition-all duration-700`}>
          {briefing}
        </p>
        <div className="flex items-center space-x-3 mt-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
              </div>
            ))}
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tactical synchronization active</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardBriefing;
