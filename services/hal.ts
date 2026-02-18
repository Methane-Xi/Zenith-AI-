
import { AcquisitionState } from '../types';

export class HardwareAbstractionLayer {
  private static instance: HardwareAbstractionLayer;
  private stream: MediaStream | null = null;

  private constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new HardwareAbstractionLayer();
    return this.instance;
  }

  async requestAccess(type: 'video' | 'audio'): Promise<{ stream: MediaStream | null; state: AcquisitionState }> {
    try {
      const constraints = type === 'video' 
        ? { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } }
        : { audio: true };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return { stream: this.stream, state: AcquisitionState.HARDWARE_READY };
    } catch (error) {
      console.error('HAL_ACCESS_DENIED:', error);
      return { stream: null, state: AcquisitionState.ERROR };
    }
  }

  stopAll() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}
