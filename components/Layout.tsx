import React, { useState } from 'react';
import { useTaskStore } from '../store';
import { LayoutGrid, Calendar, Settings, Bell, CheckCircle2, LogOut, Menu, X, Terminal as TerminalIcon, ShieldCheck } from 'lucide-react';
import { ActivePanel } from '../types';
import Terminal from './Terminal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, activePanel, setActivePanel, setIsTerminalOpen } = useTaskStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNav = (panel: ActivePanel) => {
    setActivePanel(panel);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-screen overflow-hidden text-slate-900">
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-[100] md:relative md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-8 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CheckCircle2 size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Zenith</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem 
            icon={<LayoutGrid size={20} />} 
            label="Dashboard" 
            active={activePanel === 'dashboard'} 
            onClick={() => handleNav('dashboard')}
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Schedule" 
            active={activePanel === 'calendar'} 
            onClick={() => handleNav('calendar')}
          />
          <NavItem 
            icon={<Bell size={20} />} 
            label="Reminders" 
            active={activePanel === 'notifications'} 
            onClick={() => handleNav('notifications')}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activePanel === 'settings'} 
            onClick={() => handleNav('settings')}
          />
          {user?.role === 'admin' && (
            <NavItem 
              icon={<ShieldCheck size={20} />} 
              label="Governance" 
              active={activePanel === 'admin'} 
              onClick={() => handleNav('admin')}
            />
          )}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button 
              onClick={() => setIsTerminalOpen(true)}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-900 hover:text-cyan-400 transition-all group"
            >
              <TerminalIcon size={20} className="group-hover:text-cyan-400" />
              <span>Antigravity</span>
            </button>
          </div>
        </nav>

        {user && (
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email || user.phoneNumber}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden">
        {children}
        <Terminal />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex justify-around items-center bg-white border-t border-slate-200 p-3 sticky bottom-0 z-50">
        <button onClick={() => setActivePanel('dashboard')} className={`p-2 ${activePanel === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutGrid size={24} />
        </button>
        <button onClick={() => setIsTerminalOpen(true)} className="p-2 text-slate-400">
          <TerminalIcon size={24} />
        </button>
        <button onClick={() => setActivePanel('calendar')} className={`p-2 ${activePanel === 'calendar' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Calendar size={24} />
        </button>
        <button onClick={() => setActivePanel('settings')} className={`p-2 ${activePanel === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Settings size={24} />
        </button>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    <span className={active ? 'text-indigo-600' : ''}>{icon}</span>
    <span>{label}</span>
  </button>
);

export default Layout;