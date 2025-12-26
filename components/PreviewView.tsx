
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Repeat, BrainCircuit, RefreshCw } from 'lucide-react';

interface PreviewViewProps {
  originalBlob: Blob | null;
  enhancedBlob: Blob | null;
  filename: string;
  onReset: () => void;
  aiAnalysis?: any;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ 
  originalBlob, 
  enhancedBlob, 
  filename, 
  onReset,
  aiAnalysis 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'original' | 'enhanced'>('enhanced');
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const originalUrl = useRef(originalBlob ? URL.createObjectURL(originalBlob) : '');
  const enhancedUrl = useRef(enhancedBlob ? URL.createObjectURL(enhancedBlob) : '');

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(originalUrl.current);
      URL.revokeObjectURL(enhancedUrl.current);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const switchMode = (newMode: 'original' | 'enhanced') => {
    const wasPlaying = !audioRef.current?.paused;
    const currentTime = audioRef.current?.currentTime || 0;
    setMode(newMode);
    
    // Smooth transition
    if (audioRef.current) {
      audioRef.current.src = newMode === 'enhanced' ? enhancedUrl.current : originalUrl.current;
      audioRef.current.currentTime = currentTime;
      if (wasPlaying) audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const download = () => {
    if (!enhancedBlob) return;
    const url = URL.createObjectURL(enhancedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonicstudio_${filename}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Player Control */}
        <div className="flex-1 glass rounded-3xl p-8 border border-slate-800">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold">{filename}</h2>
              <p className="text-slate-500 text-sm">Enhanced with SonicStudio AI</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => switchMode('original')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'original' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                ORIGINAL
              </button>
              <button 
                onClick={() => switchMode('enhanced')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'enhanced' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
              >
                ENHANCED
              </button>
            </div>
          </div>

          <div className="relative mb-10">
             <div className="h-2 bg-slate-900 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const pct = x / rect.width;
               if (audioRef.current) audioRef.current.currentTime = audioRef.current.duration * pct;
             }}>
               <div className="h-full bg-cyan-400" style={{ width: `${progress}%` }} />
             </div>
             <div className="flex justify-between mt-2 text-[10px] mono text-slate-600">
               <span>0:00</span>
               <span>{audioRef.current?.duration ? Math.floor(audioRef.current.duration) : '--'}s</span>
             </div>
          </div>

          <div className="flex items-center justify-center gap-10">
            <button className="text-slate-500 hover:text-white transition-colors"><Repeat className="w-5 h-5" /></button>
            <button 
              onClick={togglePlay}
              className="w-20 h-20 bg-white hover:bg-cyan-50 text-slate-950 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/10 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
            </button>
            <button className="text-slate-500 hover:text-white transition-colors"><Volume2 className="w-5 h-5" /></button>
          </div>

          <audio 
            ref={audioRef} 
            src={enhancedUrl.current} 
            onTimeUpdate={handleTimeUpdate} 
            onEnded={() => setIsPlaying(false)} 
          />
        </div>

        {/* Right: AI Analysis & Export */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="glass rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-cyan-400 w-5 h-5" />
              <h3 className="font-bold">AI Studio Report</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Noise Profile</span>
                <p className="text-slate-300 font-medium">{aiAnalysis?.noiseProfile || 'Low-frequency hum detected'}</p>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">AI Suggestion</span>
                <p className="text-slate-300 font-medium">{aiAnalysis?.suggestion || 'Voice lacks high-end presence'}</p>
              </div>
              <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20 text-xs text-cyan-400">
                <span className="font-bold uppercase mb-1 block">Technical Fix</span>
                {aiAnalysis?.technicalFix || 'Applied 2.5kHz shelf boost and noise gate'}
              </div>
            </div>
          </div>

          <button 
            onClick={download}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-5 h-5" />
            Export Master (.WAV)
          </button>

          <button 
            onClick={onReset}
            className="w-full border border-slate-800 hover:bg-slate-900 text-slate-400 py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Process New Audio
          </button>
        </div>
      </div>
    </div>
  );
};
