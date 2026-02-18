
import React, { useState } from 'react';
import { useTaskStore } from '../store';
import { LayoutGrid, Calendar, Settings, Bell, CheckCircle2, LogOut, Menu, X } from 'lucide-react';
import { ActivePanel } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, activePanel, setActivePanel } = useTaskStore();
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
        </nav>

        {user && (
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email || user.phone}</p>
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

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-slate-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center text-white">
              <CheckCircle2 size={16} />
            </div>
            <span className="font-bold text-lg">Zenith</span>
          </div>
        </div>
        {user && (
           <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-lg border border-slate-200" />
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative overflow-hidden">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex justify-around items-center bg-white border-t border-slate-200 p-3 sticky bottom-0 z-50">
        <button onClick={() => setActivePanel('dashboard')} className={`p-2 transition-colors ${activePanel === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutGrid size={24} />
        </button>
        <button onClick={() => setActivePanel('calendar')} className={`p-2 transition-colors ${activePanel === 'calendar' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Calendar size={24} />
        </button>
        <button onClick={() => setActivePanel('notifications')} className={`p-2 transition-colors ${activePanel === 'notifications' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Bell size={24} />
        </button>
        <button onClick={() => setActivePanel('settings')} className={`p-2 transition-colors ${activePanel === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
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
