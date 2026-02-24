import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTaskStore } from '../store';
import { 
  LayoutGrid, 
  Calendar, 
  Settings, 
  Bell, 
  CheckCircle2, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  Mic,
  MicOff,
  Search
} from 'lucide-react';
import { voiceService } from '../services/voice/voiceService';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, searchQuery, setSearchQuery } = useTaskStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleVoiceCommand = async () => {
    if (!voiceService.isSupported()) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    setIsListening(true);
    try {
      const command = await voiceService.startListening();
      console.log("Voice Command Received:", command);
      
      if (command.action === 'NAVIGATE') {
        const target = command.payload.target.toLowerCase();
        navigate(target === 'dashboard' ? '/' : `/${target}`);
      } else if (command.action === 'CREATE_TASK' && command.payload) {
        // Handle via store or direct navigation
        navigate('/');
      }
      // Add more command handling as needed
    } catch (error) {
      console.error("Voice Error:", error);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen h-screen overflow-hidden text-slate-900">
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-[100] md:relative md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-8 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CheckCircle2 size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Zenith</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem 
            icon={<LayoutGrid size={20} />} 
            label="Dashboard" 
            active={location.pathname === '/'} 
            to="/"
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Schedule" 
            active={location.pathname === '/calendar'} 
            to="/calendar"
          />
          <NavItem 
            icon={<Bell size={20} />} 
            label="Reminders" 
            active={location.pathname === '/notifications'} 
            to="/notifications"
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={location.pathname === '/settings'} 
            to="/settings"
          />
          {user?.role === 'admin' && (
            <NavItem 
              icon={<ShieldCheck size={20} />} 
              label="Governance" 
              active={location.pathname === '/admin'} 
              to="/admin"
            />
          )}
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
        {/* Global Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-500">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200 w-64">
              <Search size={14} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search objectives..." 
                className="bg-transparent text-xs font-medium focus:outline-none w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleVoiceCommand}
              className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
              {user?.displayName?.[0] || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex justify-around items-center bg-white border-t border-slate-200 p-3 sticky bottom-0 z-50">
        <Link to="/" className={`p-2 ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutGrid size={24} />
        </Link>
        <Link to="/calendar" className={`p-2 ${location.pathname === '/calendar' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Calendar size={24} />
        </Link>
        <Link to="/settings" className={`p-2 ${location.pathname === '/settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Settings size={24} />
        </Link>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, to }: { icon: React.ReactNode, label: string, active?: boolean, to: string }) => (
  <Link 
    to={to}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    <span className={active ? 'text-indigo-600' : ''}>{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Layout;
