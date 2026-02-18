
import React from 'react';
import { Task, TaskStatus } from '../types';
import { CheckCircle, Circle, Clock, MessageSquare, Tag, BrainCircuit } from 'lucide-react';
import { useTaskStore } from '../store';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const { updateTask, selectedTaskId, setSelectedTaskId } = useTaskStore();
  const isSelected = selectedTaskId === task.id;

  const toggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { 
      status: task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED 
    });
  };

  const getPriorityInfo = (val: number) => {
    if (val > 0.8) return { label: 'Critical', color: 'bg-red-100 text-red-600' };
    if (val > 0.6) return { label: 'High', color: 'bg-orange-100 text-orange-600' };
    if (val > 0.3) return { label: 'Medium', color: 'bg-blue-100 text-blue-600' };
    return { label: 'Low', color: 'bg-slate-100 text-slate-600' };
  };

  const priority = getPriorityInfo(task.priority);
  const hasPendingSuggestions = task.suggestions.some(s => s.status === 'pending');

  return (
    <div 
      onClick={() => setSelectedTaskId(task.id)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected 
          ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-3">
        <button 
          onClick={toggleComplete}
          className={`mt-1 transition-colors ${task.status === TaskStatus.COMPLETED ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}
        >
          {task.status === TaskStatus.COMPLETED ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-sm font-semibold truncate ${task.status === TaskStatus.COMPLETED ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {task.title}
            </h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ml-2 ${priority.color}`}>
              {priority.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500 mt-2">
            {task.deadline && (
              <div className="flex items-center space-x-1">
                <Clock size={12} className="text-slate-400" />
                <span>{new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            {task.category && (
              <div className="flex items-center space-x-1">
                <Tag size={12} className="text-slate-400" />
                <span>{task.category}</span>
              </div>
            )}
            {(task.notes.length > 0 || task.subtasks.length > 0) && (
              <div className="flex items-center space-x-1">
                <MessageSquare size={12} className="text-slate-400" />
                <span>{task.notes.length + task.subtasks.length}</span>
              </div>
            )}
            {hasPendingSuggestions && (
              <div className="flex items-center space-x-1 text-indigo-600 font-medium">
                <BrainCircuit size={12} className="animate-pulse" />
                <span>AI</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
