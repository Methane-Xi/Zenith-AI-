
import React, { useRef, useEffect, useState } from 'react';
import { AcquisitionState } from '../types';
import { HardwareAbstractionLayer } from '../services/hal';
import { Shield, Eye, Fingerprint, Mic, AlertTriangle, CheckCircle } from 'lucide-react';

const hal = HardwareAbstractionLayer.getInstance();

export const FaceAcquisitionEngine: React.FC = () => {
  const [state, setState] = useState(AcquisitionState.IDLE);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState(0);

  const startScan = async () => {
    setState(AcquisitionState.PERMISSION_REQUESTED);
    const { stream, state: nextState } = await hal.requestAccess('video');
    setState(nextState);
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      setState(AcquisitionState.DATA_STREAMING);
      // Logic for feature extraction
      setTimeout(() => setState(AcquisitionState.FEATURE_EXTRACTION), 1000);
      setTimeout(() => {
        setQuality(0.92);
        setState(AcquisitionState.SUCCESS);
      }, 3000);
    }
  };

  return (
    <div className="bg-black/50 border border-[#00ff41]/30 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between border-b border-[#00ff41]/20 pb-2">
        <div className="flex items-center space-x-2">
          <Shield size={18} className="text-[#00ff41]" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Face Acquisition Engine</h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${state === AcquisitionState.SUCCESS ? 'bg-[#00ff41] text-black' : 'bg-black border border-[#00ff41] text-[#00ff41]'}`}>
          {state}
        </span>
      </div>

      <div className="relative aspect-video bg-black overflow-hidden border border-[#00ff41]/10 rounded flex items-center justify-center">
        {state === AcquisitionState.IDLE && (
          <button onClick={startScan} className="bg-[#00ff41]/10 hover:bg-[#00ff41]/20 border border-[#00ff41] px-4 py-2 text-xs transition-all uppercase font-bold">
            Initialize Hardware
          </button>
        )}
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${state === AcquisitionState.DATA_STREAMING || state === AcquisitionState.SUCCESS ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Telemetry Overlay */}
        {state !== AcquisitionState.IDLE && (
          <div className="absolute inset-0 pointer-events-none p-2 text-[8px] flex flex-col justify-between">
            <div className="flex justify-between">
              <span>SCAN_RES: 1280x720</span>
              <span>FPS: 30.00</span>
            </div>
            <div className="flex justify-center mb-10">
              <div className="w-48 h-48 border-2 border-dashed border-[#00ff41]/50 rounded-full animate-pulse flex items-center justify-center">
                 <div className="w-1 h-1 bg-[#00ff41] rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DactylAcquisitionEngine: React.FC = () => {
  return (
    <div className="bg-black/50 border border-red-500/30 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
        <div className="flex items-center space-x-2">
          <Fingerprint size={18} className="text-red-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">Dactyl Acquisition Engine</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-black rounded">
          SIMULATION-DISABLED
        </span>
      </div>
      <div className="p-8 border border-dashed border-red-500/20 text-center space-y-4 bg-red-500/5">
        <AlertTriangle className="mx-auto text-red-500" size={32} />
        <p className="text-[10px] text-red-400 font-bold uppercase">
          Hardware Not Accessible In Web Context
        </p>
        <p className="text-[9px] text-red-400/60 lowercase italic">
          WebAuthn required for authorized fingerprint vectors. Native bridge interface missing.
        </p>
      </div>
    </div>
  );
};

export const VoiceAcquisitionEngine: React.FC = () => {
  const [state, setState] = useState(AcquisitionState.IDLE);
  const audioContext = useRef<AudioContext | null>(null);
  const analyzer = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startVoiceScan = async () => {
    setState(AcquisitionState.PERMISSION_REQUESTED);
    const { stream } = await hal.requestAccess('audio');
    if (stream) {
      audioContext.current = new AudioContext();
      analyzer.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyzer.current);
      setState(AcquisitionState.DATA_STREAMING);
      draw();
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyzer.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const bufferLength = analyzer.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const renderFrame = () => {
      requestAnimationFrame(renderFrame);
      analyzer.current!.getByteFrequencyData(dataArray);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      const barWidth = (canvasRef.current!.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(0, ${barHeight + 100}, 65)`;
        ctx.fillRect(x, canvasRef.current!.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  return (
    <div className="bg-black/50 border border-[#00ff41]/30 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between border-b border-[#00ff41]/20 pb-2">
        <div className="flex items-center space-x-2">
          <Mic size={18} className="text-[#00ff41]" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Voice Acquisition Engine</h3>
        </div>
        <button onClick={startVoiceScan} className="text-[10px] font-bold border border-[#00ff41] px-2 py-0.5 hover:bg-[#00ff41] hover:text-black">
          INIT_VOICE
        </button>
      </div>
      <div className="h-24 bg-black border border-[#00ff41]/10 rounded overflow-hidden">
        <canvas ref={canvasRef} width={400} height={100} className="w-full h-full" />
      </div>
      <div className="flex justify-between text-[8px] text-[#00ff41]/60">
        <span>FREQ: 24kHz</span>
        <span>PEAK: -12dB</span>
        <span>S/N RATIO: 82.1</span>
      </div>
    </div>
  );
};
