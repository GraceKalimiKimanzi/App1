
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, StopCircle, Play } from 'lucide-react';
import { AudioEngine } from '../services/audioEngine';

interface RecorderViewProps {
  onAudioReady: (blob: Blob, name: string) => void;
}

export const RecorderView: React.FC<RecorderViewProps> = ({ onAudioReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [engine] = useState(() => new AudioEngine());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const startRecording = async () => {
    try {
      const audioStream = await engine.startRecording();
      setStream(audioStream);
      setIsRecording(true);
      visualize(audioStream);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = async () => {
    const blob = await engine.stopRecording();
    setIsRecording(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    onAudioReady(blob, `recording-${new Date().getTime()}.wav`);
  };

  const visualize = (audioStream: MediaStream) => {
    const analyzer = engine.createVisualizer(audioStream);
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(34, 211, 238)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAudioReady(file, file.name);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
      {/* Upload Box */}
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center border-dashed border-2 border-slate-700 hover:border-cyan-500 transition-all cursor-pointer relative group">
        <input 
          type="file" 
          accept="audio/*" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleFileUpload}
        />
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="text-cyan-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Import Audio</h3>
        <p className="text-slate-400 text-sm text-center">Drag and drop or click to upload<br/>(WAV, MP3, M4A up to 50MB)</p>
      </div>

      {/* Record Box */}
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center border border-slate-800 relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <span className="text-[10px] mono text-slate-500 uppercase">{isRecording ? 'Live' : 'Standby'}</span>
        </div>
        
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={100} 
          className="w-full h-24 mb-6 rounded-lg overflow-hidden bg-slate-900/30"
        />

        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 px-8 rounded-full transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="flex items-center gap-3 bg-red-500 hover:bg-red-400 text-white font-bold py-4 px-8 rounded-full transition-all active:scale-95 shadow-lg shadow-red-500/20"
          >
            <StopCircle className="w-5 h-5" />
            Stop Recording
          </button>
        )}
        
        <p className="mt-6 text-slate-500 text-xs">Uses system default input device</p>
      </div>
    </div>
  );
};
