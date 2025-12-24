
import React, { useState } from 'react';

interface ControlPanelProps {
  onExecute: (prompt: string) => void;
  isProcessing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onExecute, isProcessing }) => {
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
            <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mission Terminal</h2>
          </div>
          <span className="text-[9px] text-zinc-700 mono">v1.0.4-LTS</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group material-surface rounded-xl overflow-hidden border border-white/5 transition-all">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/5">
              <span className="text-emerald-500 mono text-[10px] font-bold">flynt</span>
              <span className="text-zinc-600 mono text-[10px]">ideate --objective</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Build a RAG chatbot for job search using Python..."
              className="w-full h-32 bg-transparent p-4 text-[12px] text-zinc-200 focus:outline-none resize-none placeholder:text-zinc-800 font-medium leading-relaxed mono"
              disabled={isProcessing}
            />
          </div>
          
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
              isProcessing 
                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {isProcessing ? 'Deploying Sequence...' : 'Launch Deployment'}
            {!isProcessing && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Runtime</h3>
        <div className="space-y-2">
          {[
            { label: 'Persistence', value: 'SQLite-WAL' },
            { label: 'Security', value: 'GDPR / Privacy-First' },
            { label: 'Ecosystem', value: 'MCP Enabled' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[9px] text-zinc-500 font-bold uppercase">{item.label}</span>
              <span className="text-[9px] text-zinc-300 mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
         <p className="text-[9px] text-purple-400 leading-relaxed font-bold uppercase tracking-wide">
           Tip: Use deterministic test-mode in roadmap settings for offline dev.
         </p>
      </div>
    </div>
  );
};

export default ControlPanel;
