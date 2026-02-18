
import React, { useMemo } from 'react';
import { useTaskStore } from '../store';
import { Calendar as CalendarIcon, Clock, ChevronRight, LayoutGrid, Sparkles, Filter } from 'lucide-react';
import { TaskStatus } from '../types';

const CalendarView: React.FC = () => {
  const { tasks, setSelectedTaskId } = useTaskStore();

  const sortedTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.deadline && t.status !== TaskStatus.COMPLETED)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  }, [tasks]);

  const groups = useMemo(() => {
    const map: Record<string, typeof sortedTasks> = {};
    sortedTasks.forEach(task => {
      const date = new Date(task.deadline!).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      if (!map[date]) map[date] = [];
      map[date].push(task);
    });
    return Object.entries(map);
  }, [sortedTasks]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Timeline</h1>
            <p className="text-slate-500 font-medium">Your optimized AI-driven roadmap.</p>
          </div>
          <div className="flex items-center space-x-2">
             <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Filter size={14} />
                <span>Filters</span>
             </button>
             <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
               <CalendarIcon size={20} />
             </div>
          </div>
        </header>

        {groups.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mx-auto mb-6">
              <Sparkles size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">The future is a clean slate</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">Assign deadlines to your tasks and AI will build your chronological roadmap here.</p>
            <button className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest">
               Sync with Calendar
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map(([date, dayTasks]) => (
              <section key={date} className="relative pl-6 md:pl-0">
                {/* Visual Timeline Line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 md:hidden"></div>
                
                <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                  <div className="md:w-48 shrink-0">
                    <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{date.split(',')[0]}</h2>
                    <p className="text-lg font-bold text-slate-900">{date.split(',').slice(1).join(',')}</p>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="group flex items-center p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        <div className="w-14 h-14 flex flex-col items-center justify-center bg-slate-50 text-slate-800 rounded-xl mr-5 shrink-0 font-black text-[10px] uppercase border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                          <span className="leading-none">{new Date(task.deadline!).toLocaleTimeString([], { hour: 'numeric', hour12: false })}</span>
                          <span className="text-[14px] leading-tight">:</span>
                          <span className="leading-none">{new Date(task.deadline!).toLocaleTimeString([], { minute: '2-digit' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">{task.category || 'General'}</span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center bg-indigo-50/50 text-indigo-500/80 px-2 py-0.5 rounded-full">
                              <Clock size={10} className="mr-1" /> {task.duration || 'Flexible'}
                            </span>
                            {task.priority > 0.7 && (
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
