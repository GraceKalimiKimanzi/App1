
import React, { useEffect, useState } from 'react';
import { ProcessingStep } from '../types';
import { CheckCircle, Loader2, Sparkles } from 'lucide-react';

interface ProcessingViewProps {
  onComplete: () => void;
}

const STEPS: ProcessingStep[] = [
  { id: '1', name: 'Neural Denoising', description: 'Removing background hiss and room tone...', status: 'pending' },
  { id: '2', name: 'De-reverb & Clarity', description: 'Isolating voice frequencies from echoes...', status: 'pending' },
  { id: '3', name: 'Volume Normalization', description: 'Matching LUFS standards for broadcast...', status: 'pending' },
  { id: '4', name: 'Studio Mastering', description: 'Applying boutique EQ and soft-knee compression...', status: 'pending' },
];

export const ProcessingView: React.FC<ProcessingViewProps> = ({ onComplete }) => {
  const [steps, setSteps] = useState<ProcessingStep[]>(STEPS);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (currentIdx < STEPS.length) {
      const timer = setTimeout(() => {
        setSteps(prev => prev.map((s, i) => {
          if (i === currentIdx) return { ...s, status: 'active' };
          if (i < currentIdx) return { ...s, status: 'completed' };
          return s;
        }));
        
        // Wait longer for the active step
        setTimeout(() => {
          setCurrentIdx(prev => prev + 1);
        }, 1500 + Math.random() * 1000);

      }, 200);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 1000);
    }
  }, [currentIdx, onComplete]);

  return (
    <div className="max-w-xl mx-auto py-16">
      <div className="text-center mb-12">
        <div className="inline-block p-4 rounded-full bg-cyan-500/10 mb-4">
          <Sparkles className="text-cyan-400 w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Enhancing your audio</h2>
        <p className="text-slate-400">Our AI models are crafting your studio-quality master.</p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`glass p-6 rounded-xl flex items-center gap-6 transition-all duration-500 ${step.status === 'active' ? 'border-cyan-500/50 bg-cyan-500/5 scale-[1.02]' : 'opacity-60'}`}
          >
            <div className="flex-shrink-0">
              {step.status === 'completed' ? (
                <CheckCircle className="text-green-400 w-6 h-6" />
              ) : step.status === 'active' ? (
                <Loader2 className="text-cyan-400 w-6 h-6 animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-700" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold ${step.status === 'active' ? 'text-white' : 'text-slate-300'}`}>{step.name}</h4>
              <p className="text-sm text-slate-500 mt-1">{step.description}</p>
            </div>
            {step.status === 'active' && (
              <div className="flex items-center gap-1">
                 <div className="w-1 h-3 bg-cyan-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
                 <div className="w-1 h-5 bg-cyan-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
                 <div className="w-1 h-3 bg-cyan-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-900 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-cyan-500 h-full transition-all duration-700 ease-out" 
          style={{ width: `${(currentIdx / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
