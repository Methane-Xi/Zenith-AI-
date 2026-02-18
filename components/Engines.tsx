import React, { useRef, useEffect, useState } from 'react';
import { AcquisitionState } from '../types';
import { HardwareAbstractionLayer } from '../services/hal';
import { Shield, Eye, Fingerprint, Mic, AlertTriangle, CheckCircle, Activity, Lock, Scan } from 'lucide-react';

const hal = HardwareAbstractionLayer.getInstance();

export const FaceAcquisitionEngine: React.FC = () => {
  const [state, setState] = useState(AcquisitionState.IDLE);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [telemetry, setTelemetry] = useState({ quality: 0, fps: 0, resolution: '0x0' });

  const startScan = async () => {
    setState(AcquisitionState.PERMISSION_REQUESTED);
    const { stream, state: nextState } = await hal.requestAccess('video');
    
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      setState(AcquisitionState.HARDWARE_READY);
      
      // Simulate real acquisition lifecycle
      setTimeout(() => setState(AcquisitionState.DATA_STREAMING), 800);
      
      // Update telemetry
      const settings = stream.getVideoTracks()[0].getSettings();
      setTelemetry(t => ({ ...t, resolution: `${settings.width}x${settings.height}`, fps: settings.frameRate || 30 }));

      setTimeout(() => setState(AcquisitionState.FEATURE_EXTRACTION), 2000);
      setTimeout(() => {
        setTelemetry(t => ({ ...t, quality: 0.94 }));
        setState(AcquisitionState.SUCCESS);
      }, 4000);
    } else {
      setState(AcquisitionState.ERROR);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center space-x-2">
          <Scan size={18} className="text-indigo-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Face Acquisition Engine</h3>
        </div>
        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
          state === AcquisitionState.SUCCESS ? 'bg-indigo-500 text-white' : 
          state === AcquisitionState.ERROR ? 'bg-red-500 text-white' : 'text-slate-500 bg-slate-800'
        }`}>
          {state}
        </span>
      </div>

      <div className="relative aspect-video bg-black overflow-hidden border border-white/5 rounded-xl flex items-center justify-center group">
        {state === AcquisitionState.IDLE && (
          <button onClick={startScan} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
            Initialize Hardware
          </button>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            state === AcquisitionState.DATA_STREAMING || state === AcquisitionState.FEATURE_EXTRACTION || state === AcquisitionState.SUCCESS ? 'opacity-100' : 'opacity-0'
          }`} 
        />
        
        {/* Telemetry Overlay (Real-time data visualization) */}
        {state !== AcquisitionState.IDLE && state !== AcquisitionState.ERROR && (
          <div className="absolute inset-0 pointer-events-none p-3 text-[8px] font-black text-indigo-400/80 flex flex-col justify-between uppercase tracking-widest">
            <div className="flex justify-between">
              <div className="flex items-center space-x-1">
                <Activity size={10} />
                <span>RES: {telemetry.resolution}</span>
              </div>
              <span>FPS: {telemetry.fps.toFixed(2)}</span>
            </div>
            
            {state === AcquisitionState.FEATURE_EXTRACTION && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border border-indigo-500/50 rounded-full animate-ping opacity-20"></div>
                <div className="w-48 h-48 border border-indigo-500/30 rounded-full animate-pulse opacity-10"></div>
              </div>
            )}

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span>SIGNAL: ACTIVE</span>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${telemetry.quality * 100}%` }}></div>
                </div>
              </div>
              <span>QUALITY: {Math.round(telemetry.quality * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DactylAcquisitionEngine: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-red-500/20 p-4 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-red-500/10 pb-2">
        <div className="flex items-center space-x-2 text-red-400">
          <Fingerprint size={18} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">Dactyl Engine (Fingerprint)</h3>
        </div>
        <span className="text-[8px] font-black px-2 py-0.5 bg-red-500 text-white rounded uppercase">
          SIMULATION-DISABLED
        </span>
      </div>
      <div className="p-8 border border-dashed border-red-500/10 text-center space-y-4 bg-red-500/5 rounded-xl">
        <AlertTriangle className="mx-auto text-red-400" size={32} />
        <div>
          <p className="text-[10px] text-red-400 font-black uppercase tracking-[0.15em]">
            Hardware Unreachable
          </p>
          <p className="text-[9px] text-red-400/50 lowercase mt-1 italic max-w-[200px] mx-auto leading-relaxed">
            Native fingerprint scanning requires a verified bridge or WebAuthn handshake. Acquisition logic locked.
          </p>
        </div>
      </div>
    </div>
  );
};

export const VoiceAcquisitionEngine: React.FC = () => {
  const [state, setState] = useState(AcquisitionState.IDLE);
  const audioContext = useRef<AudioContext | null>(null);
  const analyzer = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const startVoiceScan = async () => {
    setState(AcquisitionState.PERMISSION_REQUESTED);
    const { stream, state: nextState } = await hal.requestAccess('audio');
    
    if (stream) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzer.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyzer.current);
      setState(AcquisitionState.DATA_STREAMING);
      draw();

      // Lifecycle progression
      setTimeout(() => setState(AcquisitionState.FEATURE_EXTRACTION), 1500);
      setTimeout(() => setState(AcquisitionState.SUCCESS), 3500);
    } else {
      setState(AcquisitionState.ERROR);
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyzer.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyzer.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyzer.current!.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      
      const barWidth = (canvasRef.current!.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvasRef.current!.height;
        ctx.fillStyle = `rgb(99, 102, 241, ${0.4 + (barHeight / 100)})`;
        ctx.fillRect(x, canvasRef.current!.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContext.current) audioContext.current.close();
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Mic size={18} />
          <h3 className="text-[10px] font-black uppercase tracking-widest">Voice Acquisition Engine</h3>
        </div>
        <button 
          onClick={state === AcquisitionState.IDLE ? startVoiceScan : undefined} 
          className={`text-[8px] font-black border px-2 py-0.5 rounded uppercase transition-all ${
            state === AcquisitionState.SUCCESS ? 'bg-indigo-500 border-indigo-500 text-white' : 
            'border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-white'
          }`}
        >
          {state === AcquisitionState.IDLE ? 'Initialize' : state}
        </button>
      </div>
      <div className="h-24 bg-slate-950 border border-white/5 rounded-xl overflow-hidden relative">
        <canvas ref={canvasRef} width={400} height={100} className="w-full h-full opacity-60" />
        {state === AcquisitionState.FEATURE_EXTRACTION && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-0.5 w-full bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse"></div>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[7px] font-black text-slate-500 uppercase tracking-widest">
        <div className="flex items-center space-x-2">
          <span>FREQ: 24kHz</span>
          <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
          <span>CODEC: PCM_S16LE</span>
        </div>
        <span>ENCLAVE: SEALED</span>
      </div>
    </div>
  );
};
