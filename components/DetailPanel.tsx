
import React, { useState, useMemo } from 'react';
import { useTaskStore } from '../store';
import { 
  X, Trash2, Calendar, Clock, Bell, Plus, 
  MessageSquare, BrainCircuit, Check, CheckCircle2, 
  Info, History, Tag, ListChecks, ChevronRight, Circle,
  Settings, Zap, Globe, Loader2, ExternalLink
} from 'lucide-react';
import { TaskStatus } from '../types';

const DetailPanel: React.FC = () => {
  const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask, addNote, handleSuggestion, toggleSubtask, deepResearch } = useTaskStore();
  const [noteText, setNoteText] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  
  const task = tasks.find(t => t.id === selectedTaskId);

  const durationParts = useMemo(() => {
    if (!task?.duration) return { val: '', unit: 'm' };
    const match = task.duration.match(/^(\d+)([mh])$/);
    if (!match) return { val: task.duration, unit: 'm' };
    return { val: match[1], unit: match[2] as 'm' | 'h' };
  }, [task?.duration]);

  if (!task) return (
    <div className="hidden lg:flex h-full w-full flex-col items-center justify-center p-8 text-center bg-white border-l border-slate-200">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
        <Info size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a focus</h3>
      <p className="text-sm text-slate-500 max-w-[240px]">
        Focus on one tactical objective. Use Deep Research to pull real-world data into your workspace.
      </p>
    </div>
  );

  const pendingSuggestions = task.suggestions.filter(s => s.status === 'pending');

  const getPriorityLabel = (val: number) => {
    if (val > 0.8) return { label: 'Critical', color: 'text-red-500' };
    if (val > 0.6) return { label: 'High', color: 'text-orange-500' };
    if (val > 0.3) return { label: 'Medium', color: 'text-blue-500' };
    return { label: 'Low', color: 'text-slate-500' };
  };

  const priorityInfo = getPriorityLabel(task.priority);

  const handleDeepResearch = async () => {
    setIsResearching(true);
    await deepResearch(task.id);
    setIsResearching(false);
  };

  const handleDurationChange = (val: string, unit: string) => {
    const newDuration = val ? `${val}${unit}` : '';
    updateTask(task.id, { duration: newDuration });
  };

  return (
    <div className="fixed inset-0 z-[60] lg:relative lg:inset-auto lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300 shadow-2xl lg:shadow-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tactical Review</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            disabled={isResearching}
            onClick={handleDeepResearch}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center space-x-1"
            title="Deep Research with Google Search"
          >
            {isResearching ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
          </button>
          <button 
            onClick={() => deleteTask(task.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setSelectedTaskId(null)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Title and Status */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <select 
              value={task.status}
              onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
              className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase border-none focus:ring-0 cursor-pointer ${
                task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center text-[11px] text-slate-400">
              <History size={12} className="mr-1" />
              {new Date(task.createdAt).toLocaleDateString()}
            </div>
          </div>
          <textarea
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            rows={2}
            className="w-full text-xl font-bold text-slate-800 border-none focus:ring-0 p-0 mb-4 bg-transparent resize-none leading-tight"
          />

          {/* Duration Editable Field */}
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm">
                <Clock size={16} />
             </div>
             <div className="flex-1 flex items-center space-x-2">
                <input 
                  type="number"
                  min="1"
                  value={durationParts.val}
                  onChange={(e) => handleDurationChange(e.target.value, durationParts.unit)}
                  placeholder="Estimated time"
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 w-full p-0"
                />
                <select 
                  value={durationParts.unit}
                  onChange={(e) => handleDurationChange(durationParts.val, e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-black text-indigo-600 uppercase tracking-widest cursor-pointer p-0 pr-4"
                >
                  <option value="m">Minutes</option>
                  <option value="h">Hours</option>
                </select>
             </div>
          </div>
        </section>

        {/* AI Suggestions Section */}
        {pendingSuggestions.length > 0 && (
          <section className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BrainCircuit size={18} className="text-indigo-600" />
                <h4 className="text-sm font-bold text-indigo-900">Neural Boost</h4>
              </div>
            </div>
            <div className="space-y-3">
              {pendingSuggestions.map(s => (
                <div key={s.id} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{s.field}</span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleSuggestion(task.id, s.id, false)} className="p-1 text-slate-300 hover:text-red-500"><X size={14} /></button>
                      <button onClick={() => handleSuggestion(task.id, s.id, true)} className="p-1 text-indigo-600 hover:text-indigo-700 bg-indigo-50 rounded"><Check size={14} /></button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-1">{s.value}</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic line-clamp-2">"{s.reasoning}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Research & Notes */}
        <section className="space-y-4 pb-20">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <MessageSquare size={12} className="mr-1" /> Research & Context
            </h4>
            <button 
              onClick={handleDeepResearch} 
              className="text-[10px] text-indigo-600 font-black uppercase hover:underline"
            >
              Sync Research
            </button>
          </div>
          <div className="relative">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Log data or results..."
              className="w-full p-4 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] shadow-inner"
            />
            <button 
              disabled={!noteText.trim()}
              onClick={() => { addNote(task.id, noteText); setNoteText(''); }}
              className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {task.notes.map(note => (
              <div key={note.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[11px] text-slate-600 relative group overflow-hidden">
                {note.content.includes('Sources:') && <div className="absolute top-0 right-0 p-2 text-indigo-500"><Globe size={12} /></div>}
                <p className="leading-relaxed whitespace-pre-wrap">{note.content}</p>
                <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase">
                  <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DetailPanel;
