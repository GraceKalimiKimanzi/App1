
export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  PREVIEW = 'PREVIEW'
}

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
  description: string;
}

export interface AudioAnalysis {
  peakLevel: number;
  averageLevel: number;
  noiseProfile: string;
  suggestion: string;
}
