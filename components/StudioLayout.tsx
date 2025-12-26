
import React from 'react';

export const StudioLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="h-16 border-b border-slate-800 glass flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight">SonicStudio <span className="text-cyan-400">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-cyan-400 transition-colors">Workspace</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Templates</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Studio Log</a>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-800 uppercase tracking-widest">Mastering Mode</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        {children}
      </main>

      <footer className="p-6 border-t border-slate-900 text-center text-slate-500 text-xs">
        &copy; 2024 SonicStudio AI • Powered by Advanced Neural Processing
      </footer>
    </div>
  );
};
