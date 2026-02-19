import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store';
import { authService } from '../../services/authService';
import { 
  Chrome, Loader2, Sparkles, ExternalLink, ShieldAlert, ShieldCheck,
  Mail, Phone, Lock, User as UserIcon, ArrowRight, ChevronLeft,
  Layout, ListChecks, Calendar, Zap
} from 'lucide-react';

type AuthMode = 'login' | 'signup';
type AuthMethod = 'options' | 'email' | 'phone';

const AuthScreen: React.FC = () => {
  const { login, signUpEmail, loginEmail, sendOtp, verifyOtp } = useTaskStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<AuthMethod>('options');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string }>({ message: '' });

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    authService.setupRecaptcha('recaptcha-container');
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError({ message: '' });
    try {
      await login();
    } catch (err: any) {
      handleAuthError(err);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError({ message: '' });
    try {
      if (mode === 'signup') {
        await signUpEmail(email, password, name);
      } else {
        await loginEmail(email, password);
      }
    } catch (err: any) {
      handleAuthError(err);
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError({ message: '' });
    try {
      const result = await sendOtp(phone);
      setConfirmationResult(result);
      setIsLoading(false);
    } catch (err: any) {
      handleAuthError(err);
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError({ message: '' });
    try {
      await verifyOtp(confirmationResult, otp);
    } catch (err: any) {
      handleAuthError(err);
      setIsLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    console.error("Auth_Error", err);
    if (err.code === 'auth/unauthorized-domain') {
      setError({
        code: 'auth/unauthorized-domain',
        message: `DOMAIN_UNAUTHORIZED: Add "${window.location.hostname}" to authorized domains.`
      });
    } else {
      setError({
        message: err.message || "Authentication failed. Check your credentials."
      });
    }
  };

  const resetMethod = () => {
    setMethod('options');
    setConfirmationResult(null);
    setError({ message: '' });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse duration-5000"></div>
        
        {/* Floating "Task" ghosts */}
        <div className="absolute top-[10%] left-[15%] opacity-10 animate-bounce transition-all duration-3000">
           <div className="w-48 h-12 bg-white rounded-xl shadow-2xl flex items-center px-4 space-x-3">
              <div className="w-4 h-4 rounded-full border border-slate-900"></div>
              <div className="w-24 h-2 bg-slate-900 rounded"></div>
           </div>
        </div>
        <div className="absolute bottom-[20%] right-[10%] opacity-10 animate-bounce duration-5000">
           <div className="w-64 h-20 bg-white rounded-3xl shadow-2xl p-4 flex flex-col justify-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-32 h-2 bg-slate-900 rounded"></div>
              </div>
              <div className="w-48 h-1.5 bg-slate-200 rounded"></div>
           </div>
        </div>
      </div>

      <div id="recaptcha-container"></div>

      <div className="w-full max-w-lg glass rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden relative z-10 backdrop-blur-xl bg-white/5 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-700">
        
        {isLoading && (
          <div className="absolute inset-0 z-[100] bg-indigo-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-400 rounded-full animate-spin"></div>
              <Zap className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
            </div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Neural Link Syncing</p>
          </div>
        )}

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Zenith</h1>
          <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest">
            {mode === 'login' ? 'Welcome back, Operator' : 'Establish New Neural Link'}
          </p>
        </div>

        {error.message && (
          <div className="mb-8 p-4 bg-red-500/20 text-red-100 rounded-2xl border border-red-500/30 flex flex-col space-y-2 animate-in shake duration-500">
            <div className="flex items-start">
              <ShieldAlert size={16} className="mr-3 mt-0.5 shrink-0 text-red-400" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-red-400">Security Breach Detection</p>
                <span className="text-xs font-medium leading-relaxed">{error.message}</span>
              </div>
            </div>
            {error.code === 'auth/unauthorized-domain' && (
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-white bg-red-600 px-3 py-1.5 rounded-xl hover:bg-red-700 transition-colors w-fit shadow-md shadow-red-100"
              >
                <span>Authorize Domain</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}

        {/* Auth Interface */}
        <div className="space-y-6">
          {method === 'options' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-4 hover:bg-indigo-50 transition-all shadow-xl active:scale-[0.98] group"
              >
                <Chrome size={20} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
                <span>Google Link</span>
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod('email')}
                  className="py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex flex-col items-center justify-center space-y-3 hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  <Mail size={20} className="text-purple-400" />
                  <span>Email</span>
                </button>
                <button
                  onClick={() => setMethod('phone')}
                  className="py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex flex-col items-center justify-center space-y-3 hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  <Phone size={20} className="text-green-400" />
                  <span>Phone</span>
                </button>
              </div>
            </div>
          )}

          {method === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-2 mb-2">
                <button onClick={resetMethod} className="p-2 text-white/40 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Email Auth Protocol</span>
              </div>
              
              {mode === 'signup' && (
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name" 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Neural Mail Address" 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Security Key" 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20"
              >
                <span>{mode === 'login' ? 'Initiate Login' : 'Register Operator'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {method === 'phone' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center space-x-2 mb-4">
                <button onClick={resetMethod} className="p-2 text-white/40 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Phone Verification Protocol</span>
              </div>

              {!confirmationResult ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-green-400 transition-colors" size={18} />
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900" 
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-500/20"
                  >
                    <span>Request OTP Blast</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                   <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-Digit Code" 
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 text-center tracking-[1em] font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Verify Neural Identity</span>
                    <Sparkles size={16} />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Auth Toggle */}
        {method !== 'phone' && (
          <div className="mt-12 text-center">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
              {mode === 'login' ? "New to Zenith Command?" : "Already Registered?"}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="ml-2 text-indigo-400 hover:text-indigo-300 transition-colors font-black border-b border-indigo-400/30"
              >
                {mode === 'login' ? "Establish Link" : "Access Hub"}
              </button>
            </p>
          </div>
        )}
        
        <div className="mt-12 flex items-center justify-center space-x-6 opacity-20">
           <Layout size={12} className="text-white" />
           <ListChecks size={12} className="text-white" />
           <Calendar size={12} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
