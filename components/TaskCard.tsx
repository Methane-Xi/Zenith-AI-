
import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { useTaskStore } from '../store';
import { CheckCircle2, Circle, Clock, Tag, BrainCircuit, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const { updateTask, setSelectedTaskId, selectedTaskId } = useTaskStore();

  const toggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { 
      status: task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED 
    });
  };

  const isSelected = selectedTaskId === task.id;

  const getPriorityColor = (level: TaskPriority) => {
    switch (level) {
      case TaskPriority.CRITICAL: return 'text-red-500 bg-red-500/10';
      case TaskPriority.HIGH: return 'text-orange-500 bg-orange-500/10';
      case TaskPriority.MEDIUM: return 'text-indigo-500 bg-indigo-500/10';
      case TaskPriority.LOW: return 'text-slate-500 bg-slate-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setSelectedTaskId(task.id)}
      className={`group relative glass p-5 rounded-[2rem] cursor-pointer transition-all hover:bg-white/5 ${isSelected ? 'ring-2 ring-indigo-500/50 bg-white/5' : ''}`}
    >
      <div className="flex items-start space-x-4">
        <button 
          onClick={toggleComplete}
          className={`mt-1 transition-colors ${task.status === TaskStatus.COMPLETED ? 'text-emerald-500' : 'text-slate-600 hover:text-indigo-400'}`}
        >
          {task.status === TaskStatus.COMPLETED ? <CheckCircle2 size={22} /> : <Circle size={22} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-bold text-sm truncate ${task.status === TaskStatus.COMPLETED ? 'text-slate-500 line-through' : 'text-white'}`}>
              {task.title}
            </h3>
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getPriorityColor(task.priorityLevel)}`}>
              {task.priorityLevel}
            </div>
          </div>

          {task.aiSummary && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed italic">
              "{task.aiSummary.standardSummary}"
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {task.deadline && (
              <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500">
                <Clock size={12} />
                <span>{new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
            {task.category && (
              <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500">
                <Tag size={12} />
                <span>{task.category}</span>
              </div>
            )}
            {task.mlPrediction && task.mlPrediction.riskScore > 70 && (
              <div className="flex items-center space-x-1 text-[10px] font-bold text-red-400">
                <AlertTriangle size={12} />
                <span>High Risk</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400/60">
              <BrainCircuit size={12} />
              <span>{task.suggestions.length} Signals</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
