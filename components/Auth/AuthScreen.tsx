import React, { useState, useEffect, useMemo } from 'react';
import { useTaskStore } from '../../store';
import { authService } from '../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Chrome, Sparkles, ShieldAlert, ShieldCheck,
  Mail, Phone, Lock, User as UserIcon, ArrowRight, ChevronLeft,
  Layout, ListChecks, Calendar, Zap, Fingerprint, Activity, Globe, Search
} from 'lucide-react';

type AuthMode = 'login' | 'signup';
type AuthMethod = 'options' | 'email' | 'phone';

const COMMON_COUNTRIES = [
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: 'JP', dial: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: 'ZA', dial: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
];

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
  
  // Phone States
  const [country, setCountry] = useState(COMMON_COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    authService.setupRecaptcha('recaptcha-container');
  }, [method]);

  const filteredCountries = useMemo(() => {
    return COMMON_COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.dial.includes(searchQuery)
    );
  }, [searchQuery]);

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
      // Construct full E.164 number
      const fullNumber = `${country.dial}${phone.replace(/\D/g, '')}`;
      const result = await sendOtp(fullNumber);
      setConfirmationResult(result);
      setIsLoading(false);
    } catch (err: any) {
      handleAuthError(err);
      setIsLoading(false);
      // Reset recaptcha for another attempt
      authService.setupRecaptcha('recaptcha-container');
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
    // Safely extract message and code to avoid circular structure issues
    const msg = typeof err === 'string' ? err : (err.message || "Authentication protocol failed. Check signals.");
    const code = err.code || 'UNKNOWN_ERROR';
    setError({ message: msg, code });
  };

  const resetMethod = () => {
    setMethod('options');
    setConfirmationResult(null);
    setError({ message: '' });
    setIsCountrySelectorOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Dynamic Security Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[20%] -left-[20%] w-[100%] h-[100%] bg-indigo-600/10 rounded-full blur-[140px]"
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -bottom-[20%] -right-[20%] w-[100%] h-[100%] bg-purple-600/10 rounded-full blur-[140px]"
        />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      </div>

      {/* Hidden Recaptcha Anchor */}
      <div id="recaptcha-container" className="fixed bottom-0 right-0 pointer-events-none opacity-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden backdrop-blur-3xl bg-white/5 p-8 md:p-12 relative">
          
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-[#020617]/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-2 border-white/5 border-t-indigo-500 rounded-full"
                  />
                  <Zap className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Establishing Link</p>
                  <p className="text-[8px] font-bold text-indigo-400/40 uppercase tracking-widest">Global Relay Protocol Active</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 mx-auto mb-6 relative"
            >
              <ShieldCheck size={32} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#020617] flex items-center justify-center">
                <Activity size={8} className="text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Zenith</h1>
            <p className="text-indigo-200/40 text-[9px] font-black uppercase tracking-[0.3em]">
              {mode === 'login' ? 'Unified Security Access' : 'Create Operator Node'}
            </p>
          </div>

          {/* Error Feed */}
          <AnimatePresence>
            {error.message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 text-red-100 rounded-2xl border border-red-500/30 flex items-start space-x-3 overflow-hidden"
              >
                <ShieldAlert size={18} className="shrink-0 text-red-500" />
                <p className="text-xs font-medium">{error.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interface Panels */}
          <AnimatePresence mode="wait">
            {method === 'options' ? (
              <motion.div 
                key="options"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-4"
              >
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-4 hover:bg-indigo-50 transition-all active:scale-[0.98] group"
                >
                  <Chrome size={20} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
                  <span>Google Link Identity</span>
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMethod('email')}
                    className="py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex flex-col items-center justify-center space-y-3 hover:bg-white/10 transition-all group"
                  >
                    <Mail size={22} className="text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>Neural Mail</span>
                  </button>
                  <button
                    onClick={() => setMethod('phone')}
                    className="py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex flex-col items-center justify-center space-y-3 hover:bg-white/10 transition-all group"
                  >
                    <Globe size={22} className="text-green-400 group-hover:scale-110 transition-transform" />
                    <span>Signal Link</span>
                  </button>
                </div>
              </motion.div>
            ) : method === 'phone' ? (
              <motion.div 
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <button onClick={resetMethod} className="p-2 text-white/30 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Signal Link Protocol</span>
                </div>

                {!confirmationResult ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div className="relative">
                      {/* Country Selector Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all z-20"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-[10px] font-black text-white">{country.dial}</span>
                      </button>

                      <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Local signal number" 
                        className="w-full pl-28 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-bold"
                      />

                      {/* Country Dropdown */}
                      <AnimatePresence>
                        {isCountrySelectorOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 w-full mb-3 bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[50] max-h-64 flex flex-col backdrop-blur-2xl"
                          >
                            <div className="p-4 border-b border-white/5 flex items-center space-x-3">
                              <Search size={14} className="text-white/30" />
                              <input 
                                type="text"
                                placeholder="Search country code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-xs text-white w-full p-0 placeholder-white/20"
                              />
                            </div>
                            <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                              {filteredCountries.map(c => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setCountry(c);
                                    setIsCountrySelectorOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${country.code === c.code ? 'bg-indigo-600 text-white' : 'text-white/60 hover:bg-white/5'}`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className="text-base">{c.flag}</span>
                                    <span className="text-[10px] font-bold truncate">{c.name}</span>
                                  </div>
                                  <span className="text-[10px] font-black opacity-60">{c.dial}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 active:scale-[0.98]"
                    >
                      <span>Dispatch OTP Signal</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpVerify} className="space-y-6">
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Verify Transmitted Vector</p>
                      <p className="text-[8px] text-white/30 uppercase tracking-wider italic">OTP sent to {country.dial} {phone}</p>
                    </div>
                    
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000" 
                      className="w-full py-6 bg-white/5 border border-white/10 rounded-2xl text-white text-center tracking-[1.5em] font-black text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />

                    <button
                      type="submit"
                      className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                      <span>Authorize Operator</span>
                      <Sparkles size={16} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setConfirmationResult(null)}
                      className="w-full text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-colors"
                    >
                      Resend Link
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.form 
                key="email"
                onSubmit={handleEmailAuth}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <button type="button" onClick={resetMethod} className="p-2 text-white/30 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Email Link Protocol</span>
                </div>
                
                {mode === 'signup' && (
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Operator Display Name" 
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Command Email" 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Security Passkey" 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-indigo-500/20"
                >
                  <span>{mode === 'login' ? 'Initiate Access' : 'Register Operator'}</span>
                  <ArrowRight size={16} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">
              {mode === 'login' ? "Unlinked Signal?" : "Already Authorized?"}
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  resetMethod();
                }}
                className="ml-2 text-indigo-400 hover:text-indigo-300 transition-colors font-black border-b border-indigo-400/20"
              >
                {mode === 'login' ? "Establish Node" : "Access Console"}
              </button>
            </p>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-8 opacity-20 grayscale">
             <Layout size={12} className="text-white" />
             <ListChecks size={12} className="text-white" />
             <Calendar size={12} className="text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
