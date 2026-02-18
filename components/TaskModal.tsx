
import React, { useState } from 'react';
import { useTaskStore } from '../store';
import { X, Clock, Zap, Tag, MessageSquare, BrainCircuit, Check, Activity, Loader2 } from 'lucide-react';

// COMPLETE: Finished the TaskModal component which was previously truncated.
// Added missing default export to resolve "Module has no default export" error.
const TaskModal: React.FC = () => {
  const { isTaskModalOpen, setIsTaskModalOpen, addTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0.5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<'m' | 'h' | 'd'>('m');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isTaskModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const duration = durationValue ? `${durationValue}${durationUnit}` : undefined;
    
    await addTask(title.trim(), {
      description: description.trim(),
      priority,
      duration,
      energyLevel
    });

    setIsSubmitting(false);
    setIsTaskModalOpen(false);
    setTitle('');
    setDescription('');
    setDurationValue('');
    setEnergyLevel(5);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Task Orchestration</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Neural Link Active</p>
            </div>
          </div>
          <button 
            onClick={() => setIsTaskModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective Name</label>
            <input
              autoFocus
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tactical Context (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details or deep context..."
              rows={3}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all text-sm font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration Projection</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:bg-white transition-all">
                <Clock size={18} className="text-slate-400" />
                <input
                  type="number"
                  min="1"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  placeholder="Estim."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 py-4 px-2"
                />
                <select 
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as 'm' | 'h' | 'd')}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-black text-indigo-600 uppercase tracking-widest cursor-pointer py-4"
                >
                  <option value="m">Min</option>
                  <option value="h">Hrs</option>
                  <option value="d">Day</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Index (0.0 - 1.0)</label>
              <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
                <Zap size={18} className={priority > 0.7 ? 'text-red-500' : 'text-slate-400'} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={priority}
                  onChange={(e) => setPriority(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs font-black text-slate-700 w-8">{priority.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Energy Required (Cognitive Load)</label>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
              <div className="flex items-center space-x-4 flex-1">
                <Activity size={18} className="text-slate-400" />
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <span className="text-xs font-black text-slate-700 ml-4">LVL {energyLevel}</span>
            </div>
          </div>

          <div className="pt-4 shrink-0">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Check size={18} />
                  <span>Deploy Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
