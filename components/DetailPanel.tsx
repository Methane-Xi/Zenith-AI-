import React, { useState } from 'react';
import { useTaskStore } from '../store';
import { TaskStatus, TaskPriority } from '../types';
import { 
  X, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Sparkles, 
  BrainCircuit, 
  Search, 
  TrendingUp,
  BookOpen,
  Layers as LayersIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailPanel: React.FC = () => {
  const { 
    tasks, 
    selectedTaskId, 
    setSelectedTaskId, 
    updateTask, 
    deleteTask, 
    addNote, 
    toggleSubtask, 
    handleSuggestion,
    deepResearch,
    user
  } = useTaskStore();

  const [newNote, setNewNote] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [summaryTab, setSummaryTab] = useState<'standard' | 'simplified' | 'bullet'>('standard');

  const task = tasks.find(t => t.id === selectedTaskId);

  if (!task) return (
    <div className="hidden lg:flex w-96 border-l border-white/5 bg-black/20 items-center justify-center p-8 text-center">
      <div className="space-y-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
          <LayersIcon size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select a tactical unit to view telemetry</p>
      </div>
    </div>
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addNote(task.id, newNote);
    setNewNote('');
  };

  const onDeepResearch = async () => {
    setIsResearching(true);
    await deepResearch(task.id);
    setIsResearching(false);
  };

  return (
    <motion.aside 
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      className="fixed inset-y-0 right-0 z-[110] lg:relative lg:z-0 w-full lg:w-96 glass border-l border-white/10 flex flex-col h-full overflow-hidden"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Unit Telemetry</span>
        </div>
        <button onClick={() => setSelectedTaskId(null)} className="p-2 text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Header Section */}
        <section className="space-y-4">
          <input 
            type="text" 
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            className="w-full bg-transparent text-xl font-black text-white focus:outline-none"
          />
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">
              <Clock size={12} />
              <input 
                type="text" 
                value={task.duration || ''} 
                onChange={(e) => updateTask(task.id, { duration: e.target.value })}
                placeholder="Duration"
                className="bg-transparent w-12 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">
              <Tag size={12} />
              <input 
                type="text" 
                value={task.category || ''} 
                onChange={(e) => updateTask(task.id, { category: e.target.value })}
                placeholder="Category"
                className="bg-transparent w-20 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* AI Summary Section */}
        {task.aiSummary && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                 <Sparkles size={14} />
                 <span>Neural Summary</span>
               </div>
               <div className="text-[10px] font-bold text-slate-500">
                 Readability: {task.aiSummary.readabilityScore}%
               </div>
            </div>
            
            <div className="glass rounded-2xl p-4 space-y-4">
               <div className="flex p-1 bg-white/5 rounded-xl">
                  {(['standard', 'simplified', 'bullet'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setSummaryTab(tab)}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${summaryTab === tab ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>
               
               <div className="text-xs text-slate-300 leading-relaxed min-h-[60px]">
                  {summaryTab === 'standard' && task.aiSummary.standardSummary}
                  {summaryTab === 'simplified' && task.aiSummary.simplifiedSummary}
                  {summaryTab === 'bullet' && (
                    <ul className="space-y-2">
                      {task.aiSummary.bulletSummary.map((b, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
               </div>
            </div>
          </section>
        )}

        {/* ML Predictions Section */}
        {task.mlPrediction && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              <TrendingUp size={14} />
              <span>Predictive Analytics</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass p-3 rounded-xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Risk Score</p>
                <p className={`text-sm font-black ${task.mlPrediction.riskScore > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {task.mlPrediction.riskScore}%
                </p>
              </div>
              <div className="glass p-3 rounded-xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Est. Completion</p>
                <p className="text-sm font-black text-white">{task.mlPrediction.predictedCompletionTime}</p>
              </div>
            </div>
          </section>
        )}

        {/* AI Suggestions */}
        <AnimatePresence>
          {task.suggestions.filter(s => s.status === 'pending').length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <BrainCircuit size={14} />
                <span>Neural Signals</span>
              </div>
              <div className="space-y-3">
                {task.suggestions.filter(s => s.status === 'pending').map(suggestion => (
                  <motion.div 
                    key={suggestion.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass p-4 rounded-2xl border border-indigo-500/20 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{suggestion.field}</p>
                        <p className="text-xs font-bold text-white">{suggestion.value}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleSuggestion(task.id, suggestion.id, false)}
                          className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                        <button 
                          onClick={() => handleSuggestion(task.id, suggestion.id, true)}
                          className="p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition-colors"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">"{suggestion.reasoning}"</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </AnimatePresence>

        {/* Subtasks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-black text-white uppercase tracking-widest">
            <span>Sub-Objectives</span>
            <span className="text-slate-500">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
          </div>
          <div className="space-y-2">
            {task.subtasks.map(sub => (
              <div key={sub.id} className="flex items-center space-x-3 group">
                <button 
                  onClick={() => toggleSubtask(task.id, sub.id)}
                  className={`transition-colors ${sub.completed ? 'text-emerald-500' : 'text-slate-600 hover:text-indigo-400'}`}
                >
                  <CheckCircle2 size={18} />
                </button>
                <span className={`text-xs flex-1 ${sub.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{sub.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="pt-4 space-y-3">
          <button 
            onClick={onDeepResearch}
            disabled={isResearching}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {isResearching ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Search size={14} />
            )}
            <span>Deep Research</span>
          </button>
          
          <button 
            onClick={() => deleteTask(task.id)}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={14} />
            <span>Decommission Unit</span>
          </button>
        </section>

        {/* Notes */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-[10px] font-black text-white uppercase tracking-widest">
            <BookOpen size={14} />
            <span>Intelligence Logs</span>
          </div>
          <form onSubmit={handleAddNote} className="relative">
            <input 
              type="text" 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add log entry..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-indigo-300">
              <Plus size={18} />
            </button>
          </form>
          <div className="space-y-4">
            {task.notes.map(note => (
              <div key={note.id} className="glass p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Log Entry</span>
                  <span>{new Date(note.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.aside>
  );
};

const Layers = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.27a2 2 0 0 0 0 3.66l8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09a2 2 0 0 0 0-3.66Z"/><path d="m2.6 14.07 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"/><path d="m2.6 10.17 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"/>
  </svg>
);

export default DetailPanel;