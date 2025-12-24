
import React, { useState } from 'react';

interface ControlPanelProps {
  onExecute: (prompt: string) => void;
  isProcessing: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onExecute, isProcessing, isPaused, onTogglePause }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onExecute(input);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8 flex-1 border-b border-white/5 overflow-y-auto custom-scrollbar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></div>
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mission Terminal</h2>
          </div>
          <span className="text-[9px] text-zinc-700 mono">v1.0.4-LTS</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group material-surface rounded-2xl overflow-hidden border border-white/10 transition-all focus-within:border-purple-500/50">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/[0.03]">
              <span className="text-emerald-500 mono text-[9px] font-black uppercase tracking-tighter">flynt</span>
              <span className="text-zinc-600 mono text-[9px] tracking-tighter">ideate --objective</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your architecture or objective..."
              className="w-full h-32 bg-transparent p-4 text-[12px] text-zinc-200 focus:outline-none resize-none placeholder:text-zinc-800 font-medium leading-relaxed mono"
              disabled={isProcessing}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
                isProcessing 
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5' 
                  : 'bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5'
              }`}
            >
              {isProcessing ? (
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                   <span>Deploying Graph</span>
                 </div>
              ) : 'Launch Deployment'}
              {!isProcessing && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              )}
            </button>

            {isProcessing && (
              <button
                type="button"
                onClick={onTogglePause}
                className={`w-14 rounded-xl border flex items-center justify-center transition-all ${
                  isPaused 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
                    : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
                }`}
              >
                {isPaused ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Runtime Nodes</h3>
        <div className="space-y-2">
          {[
            { label: 'State Sync', value: 'Active', color: 'text-emerald-400' },
            { label: 'Sandboxing', value: 'Isolated', color: 'text-zinc-400' },
            { label: 'Ecosystem', value: 'MCP / RAG', color: 'text-zinc-400' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">{item.label}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 mt-auto">
         <p className="text-[9px] text-purple-400/80 leading-relaxed font-bold uppercase tracking-[0.2em] text-center">
           Flynt Protocol: Stateless Inference v4
         </p>
      </div>
    </div>
  );
};

export default ControlPanel;
