
import React, { useState } from 'react';
import { useTaskStore } from '../store';
import { Sparkles, Command, BrainCircuit, Loader2, Plus } from 'lucide-react';

const TaskInput: React.FC = () => {
  const [title, setTitle] = useState('');
  const [isExploding, setIsExploding] = useState(false);
  const { addTask, explodeProject, setIsTaskModalOpen } = useTaskStore();

  const isProjectCommand = title.toLowerCase().startsWith('plan ') || title.toLowerCase().startsWith('project ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setIsTaskModalOpen(true);
      return;
    }

    if (isProjectCommand) {
      setIsExploding(true);
      await explodeProject(title.replace(/^(plan|project)\s+/i, ''));
      setIsExploding(false);
      setTitle('');
    } else {
      // Direct commit via AI extraction logic in store
      await addTask(title.trim());
      setTitle('');
    }
  };

  return (
    <div className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch gap-3">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            {isExploding ? (
              <Loader2 size={20} className="animate-spin text-indigo-600" />
            ) : isProjectCommand ? (
              <BrainCircuit size={20} className="text-purple-600" />
            ) : (
              <Sparkles size={20} />
            )}
          </div>
          <input
            type="text"
            value={title}
            disabled={isExploding}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => {}} 
            placeholder={isExploding ? "AI is orchestrating roadmap..." : "Type 'Plan a launch' or click + for details..."}
            className={`w-full pl-12 pr-4 py-3.5 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-2xl text-slate-800 placeholder-slate-400 font-medium transition-all shadow-sm ${
              isProjectCommand ? 'bg-purple-50' : 'bg-slate-100'
            }`}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsTaskModalOpen(true)}
            className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
            title="Detailed Task Orchestration"
          >
            <Plus size={20} />
          </button>
          
          <button
            type="submit"
            disabled={!title.trim() && !isProjectCommand}
            className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-100 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            {isProjectCommand ? <span>Orchestrate</span> : <span>Commit</span>}
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-white/10 rounded text-[8px] opacity-60">
              <Command size={8} />
              <span>Enter</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;
