import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Play,
  Pause,
  RotateCcw,
  Edit3,
  ChevronLeft,
  Save,
  Layers as LayersIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DetailPanelProps {
  isPage?: boolean;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
};

const formatTimeDigital = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const DetailPanel: React.FC<DetailPanelProps> = ({ isPage }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  } = useTaskStore();

  const [newNote, setNewNote] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [summaryTab, setSummaryTab] = useState<'standard' | 'simplified' | 'bullet'>('standard');
  const [isSettingDuration, setIsSettingDuration] = useState(false);
  const [durationMode, setDurationMode] = useState<'manual' | 'dial'>('manual');
  
  // Manual Entry States
  const [manualH, setManualH] = useState(0);
  const [manualM, setManualM] = useState(0);
  const [manualS, setManualS] = useState(0);

  // Dial Picker States
  const [dialValue, setDialValue] = useState(30); // minutes
  const [dialUnit, setDialUnit] = useState<'m' | 'h' | 'd'>('m');

  const taskId = isPage ? id : selectedTaskId;
  const task = tasks.find(t => t.id === taskId);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (task?.timerStatus === 'running' && (task.remainingSeconds || 0) > 0) {
      timerRef.current = setInterval(() => {
        const nextSeconds = (task.remainingSeconds || 0) - 1;
        if (nextSeconds <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          updateTask(task.id, { 
            remainingSeconds: 0, 
            timerStatus: 'completed',
            status: TaskStatus.COMPLETED 
          });
        } else {
          updateTask(task.id, { remainingSeconds: nextSeconds });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [task?.timerStatus, task?.remainingSeconds, task?.id]);

  if (!task) {
    if (isPage) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-950/50">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
              <LayersIcon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical unit not found or decommissioned</p>
            <button onClick={() => navigate('/')} className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-300">Return to Command</button>
          </div>
        </div>
      );
    }
    return null;
  }

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

  const saveDuration = () => {
    let totalSeconds = 0;
    if (durationMode === 'manual') {
      totalSeconds = (manualH * 3600) + (manualM * 60) + manualS;
    } else {
      if (dialUnit === 'm') totalSeconds = dialValue * 60;
      else if (dialUnit === 'h') totalSeconds = dialValue * 3600;
      else if (dialUnit === 'd') totalSeconds = dialValue * 86400;
    }

    if (totalSeconds < 30) totalSeconds = 30; // Min 30s

    updateTask(task.id, { 
      durationInSeconds: totalSeconds, 
      remainingSeconds: totalSeconds,
      timerStatus: 'idle',
      duration: formatTime(totalSeconds)
    });
    setIsSettingDuration(false);
  };

  const startTimer = () => {
    if (!task.durationInSeconds) return;
    updateTask(task.id, { timerStatus: 'running' });
  };

  const pauseTimer = () => {
    updateTask(task.id, { timerStatus: 'paused' });
  };

  const resetTimer = () => {
    updateTask(task.id, { 
      remainingSeconds: task.durationInSeconds || 0, 
      timerStatus: 'idle' 
    });
  };

  const progress = task.durationInSeconds ? ((task.durationInSeconds - (task.remainingSeconds || 0)) / task.durationInSeconds) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col h-full overflow-hidden bg-slate-950/50 ${isPage ? 'flex-1' : 'w-96 border-l border-white/10'}`}
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center space-x-4">
          <button onClick={() => isPage ? navigate('/') : setSelectedTaskId(null)} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Unit Telemetry</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <select 
             value={task.status}
             onChange={(e) => updateTask(task.id, { status: e.target.value as any })}
             className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-indigo-500/50"
           >
             {Object.values(TaskStatus).map(status => (
               <option key={status} value={status} className="bg-slate-900">{status}</option>
             ))}
           </select>
           <button className="p-2 text-indigo-400 hover:text-white transition-colors bg-indigo-500/10 rounded-xl border border-indigo-500/20">
             <Save size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Header Section */}
        <section className="space-y-4">
          <input 
            type="text" 
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            className="w-full bg-transparent text-3xl font-black text-white focus:outline-none tracking-tighter"
          />
          
          <textarea 
            value={task.description || ''}
            onChange={(e) => updateTask(task.id, { description: e.target.value })}
            placeholder="Add tactical description..."
            className="w-full bg-transparent text-sm text-slate-400 focus:outline-none min-h-[100px] resize-none leading-relaxed"
          />

          <div className="flex flex-wrap gap-2">
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

        {/* DURATION & TIMER PANEL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              <Clock size={14} />
              <span>Duration & Timer</span>
            </div>
            <button 
              onClick={() => setIsSettingDuration(!isSettingDuration)}
              className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-colors"
            >
              <Edit3 size={14} />
            </button>
          </div>

          <div className="glass rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden bg-black/40">
            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
              />
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Remaining Time</p>
                <motion.p 
                  key={task.remainingSeconds}
                  initial={task.timerStatus === 'running' ? { scale: 1.1, opacity: 0.8 } : {}}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`text-6xl font-black tracking-tighter tabular-nums ${task.timerStatus === 'running' ? 'text-white' : 'text-slate-400'}`}
                >
                  {formatTimeDigital(task.remainingSeconds || 0)}
                </motion.p>
              </div>

              <div className="flex items-center space-x-6">
                <AnimatePresence mode="wait">
                  {task.timerStatus === 'running' ? (
                    <motion.button 
                      key="pause"
                      initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={pauseTimer} 
                      className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                    >
                      <Pause size={28} />
                    </motion.button>
                  ) : (
                    <motion.button 
                      key="play"
                      initial={{ opacity: 0, scale: 0.8, rotate: 90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: -90 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={startTimer} 
                      disabled={!task.durationInSeconds || task.timerStatus === 'completed'}
                      className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/30 disabled:opacity-20"
                    >
                      <Play size={28} className="ml-1" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: -180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={resetTimer} 
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5"
                >
                  <RotateCcw size={22} />
                </motion.button>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  task.timerStatus === 'running' ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' :
                  task.timerStatus === 'paused' ? 'bg-yellow-500/10 text-yellow-400' :
                  task.timerStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-white/5 text-slate-500'
                }`}>
                  {task.timerStatus || 'Idle'}
                </span>
                <span className="text-[10px] font-bold text-slate-600 uppercase">/ Total: {formatTime(task.durationInSeconds || 0)}</span>
              </div>
            </div>
          </div>

          {/* DURATION SETTER MODAL-ISH */}
          <AnimatePresence>
            {isSettingDuration && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-3xl p-6 border border-white/10 space-y-6 overflow-hidden bg-black/40"
              >
                <div className="flex p-1 bg-white/5 rounded-xl">
                  <button
                    onClick={() => setDurationMode('manual')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${durationMode === 'manual' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500'}`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setDurationMode('dial')}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${durationMode === 'dial' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500'}`}
                  >
                    Dial
                  </button>
                </div>

                {durationMode === 'manual' ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Hours</label>
                      <input 
                        type="number" 
                        value={manualH} 
                        onChange={(e) => setManualH(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Mins</label>
                      <input 
                        type="number" 
                        value={manualM} 
                        onChange={(e) => setManualM(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Secs</label>
                      <input 
                        type="number" 
                        value={manualS} 
                        onChange={(e) => setManualS(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                        <motion.circle 
                          cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeWidth="6" 
                          className="text-cyan-500"
                          strokeDasharray="477"
                          strokeDashoffset={477 - (477 * (dialValue / (dialUnit === 'm' ? 60 : dialUnit === 'h' ? 24 : 7)))}
                        />
                      </svg>
                      <div className="text-center z-10">
                        <input 
                          type="number" 
                          value={dialValue}
                          onChange={(e) => setDialValue(Math.max(1, parseInt(e.target.value) || 1))}
                          className="bg-transparent text-4xl font-black text-white w-24 text-center focus:outline-none"
                        />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dialUnit === 'm' ? 'Minutes' : dialUnit === 'h' ? 'Hours' : 'Days'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      {(['m', 'h', 'd'] as const).map(u => (
                        <button
                          key={u}
                          onClick={() => setDialUnit(u)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dialUnit === u ? 'bg-cyan-500 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={saveDuration}
                  className="w-full py-4 bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/30"
                >
                  Set Tactical Duration
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
            onClick={() => {
              deleteTask(task.id);
              if (isPage) navigate('/');
            }}
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
    </motion.div>
  );
};

const Layers = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.27a2 2 0 0 0 0 3.66l8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09a2 2 0 0 0 0-3.66Z"/><path d="m2.6 14.07 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"/><path d="m2.6 10.17 8.57 4.09a2 2 0 0 0 1.66 0l8.57-4.09"/>
  </svg>
);

export default DetailPanel;
