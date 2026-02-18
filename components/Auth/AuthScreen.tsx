import React, { useState } from 'react';
import { useTaskStore } from '../../store';
import { 
  Chrome, Loader2, CheckCircle2, AlertCircle, Sparkles, ExternalLink, ShieldAlert
} from 'lucide-react';

const AuthScreen: React.FC = () => {
  const { login } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string }>({ message: '' });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError({ message: '' });
    try {
      await login();
    } catch (err: any) {
      console.error("Login_Catch", err);
      
      if (err.code === 'auth/unauthorized-domain') {
        setError({
          code: 'auth/unauthorized-domain',
          message: `UNAUTHORIZED_DOMAIN: You must add "${window.location.hostname}" to the Authorized Domains list in your Firebase Console.`
        });
      } else {
        setError({
          message: err.message || "Sign-in failed. Check console for tactical logs."
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden relative p-12">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} strokeWidth={2.5} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Enclave</p>
          </div>
        )}

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight text-center">Zenith</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium text-center">Access the multi-modal tactical cloud.</p>
        </div>

        {error.message && (
          <div className="mb-6 p-5 bg-red-50 text-red-700 rounded-3xl border border-red-100 flex flex-col space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start">
              <ShieldAlert size={18} className="mr-3 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-800">Security Alert</p>
                <span className="text-xs font-bold leading-relaxed">{error.message}</span>
              </div>
            </div>
            {error.code === 'auth/unauthorized-domain' && (
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-fit shadow-md shadow-red-100"
              >
                <span>Authorize {window.location.hostname}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-4 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] group"
          >
            <Chrome size={20} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
            <span>Login with Google</span>
          </button>
          
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Forced high-assurance login.<br/>Domain verification active.
            </p>
          </div>
        </div>
        
        <div className="mt-12 flex items-center justify-center space-x-2 opacity-30">
           <Sparkles size={12} className="text-amber-500" />
           <span className="text-[8px] font-black uppercase tracking-[0.5em]">Neural Link Established</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;