
import React, { useState } from 'react';
import { StudioLayout } from './components/StudioLayout';
import { RecorderView } from './components/RecorderView';
import { ProcessingView } from './components/ProcessingView';
import { PreviewView } from './components/PreviewView';
import { AppState } from './types';
import { AudioEngine } from './services/audioEngine';
import { analyzeAudioWithAI } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [originalBlob, setOriginalBlob] = useState<Blob | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const handleAudioReady = async (blob: Blob, name: string) => {
    setOriginalBlob(blob);
    setFilename(name);
    setAppState(AppState.PROCESSING);

    // Initialise audio engine to process
    const engine = new AudioEngine();
    await engine.init();

    // Parallel execution: Enhancement + AI Analysis
    try {
      const [processedBlob, analysis] = await Promise.all([
        engine.applyStudioEnhancement(blob),
        analyzeAudioWithAI(`A ${blob.size} byte file named ${name}`)
      ]);
      
      setEnhancedBlob(processedBlob);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error("Processing failed", err);
      // Fallback
      setEnhancedBlob(blob);
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return (
          <>
            <div className="text-center mt-12 mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Studio-grade audio. <br/>
                <span className="text-cyan-400">Powered by AI.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Transform voice recordings into professional podcast-ready masters instantly. 
                Noise reduction, de-reverb, and broadcast-ready leveling in seconds.
              </p>
            </div>
            <RecorderView onAudioReady={handleAudioReady} />
          </>
        );
      case AppState.PROCESSING:
        return <ProcessingView onComplete={() => setAppState(AppState.PREVIEW)} />;
      case AppState.PREVIEW:
        return (
          <PreviewView 
            originalBlob={originalBlob} 
            enhancedBlob={enhancedBlob} 
            filename={filename} 
            aiAnalysis={aiAnalysis}
            onReset={() => {
              setAppState(AppState.IDLE);
              setEnhancedBlob(null);
              setOriginalBlob(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StudioLayout>
      {renderContent()}
    </StudioLayout>
  );
};

export default App;
