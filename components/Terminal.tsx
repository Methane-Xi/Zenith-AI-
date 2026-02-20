import React, { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../store';
import { Terminal as TerminalIcon, X, TerminalSquare, Loader2, ChevronRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Terminal: React.FC = () => {
  const { isTerminalOpen, setIsTerminalOpen, terminalHistory, sendTerminalQuery } = useTaskStore();
  const [input, setInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalHistory, isQuerying]);

  if (!isTerminalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isQuerying) return;

    const q = input.trim();
    setInput('');
    setIsQuerying(true);
    await sendTerminalQuery(q);
    setIsQuerying(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[600px] h-[500px] bg-[#020617] border border-white/10 rounded-3xl shadow-2xl z-[300] flex flex-col overflow-hidden backdrop-blur-2xl"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center space-x-3">
          <TerminalSquare size={18} className="text-cyan-400" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Antigravity Console (Model: Pro-v3)</h2>
        </div>
        <button 
          onClick={() => setIsTerminalOpen(false)}
          className="p-1.5 text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Output Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-4 custom-scrollbar"
      >
        <div className="text-slate-500 italic mb-6">
          [ZENITH_OS_READY] Neural link established with ANTIGRAVITY v3.1. Coding engine operational.
        </div>

        {terminalHistory.map((entry, idx) => (
          <div key={idx} className={`flex flex-col space-y-2 ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              entry.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/5 text-cyan-50 border border-cyan-500/10'
            }`}>
              {entry.parts[0].text.split('\n').map((line, lIdx) => (
                <div key={lIdx} className={line.startsWith('```') ? 'text-cyan-400 font-bold' : ''}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}

        {isQuerying && (
          <div className="flex items-center space-x-3 text-cyan-500/50 animate-pulse">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Antigravity is calculating...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5">
        <div className="relative flex items-center bg-black/40 rounded-2xl border border-white/5 focus-within:border-cyan-500/50 transition-all">
          <div className="pl-4 text-cyan-500">
            <ChevronRight size={16} />
          </div>
          <input 
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command input... (e.g. 'Optimize this fetch call')"
            className="flex-1 bg-transparent border-none focus:ring-0 text-cyan-50 font-mono text-xs p-4"
          />
          <button 
            type="submit"
            className="pr-4 text-cyan-500 hover:text-cyan-300 transition-colors"
          >
            <CornerDownLeft size={16} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Terminal;