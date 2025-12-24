
import React, { useState } from 'react';
// Added AgentType to the imports to resolve the error on line 121
import { AgentNode, AgentStatus, AgentType } from '../types';
import { COLORS } from '../constants';

interface AgentDetailsProps {
  node: AgentNode | null;
  onClose: () => void;
}

const AgentDetails: React.FC<AgentDetailsProps> = ({ node, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const agentKey = node.type.replace('Agent', '').toUpperCase();
  const color = (COLORS as any)[agentKey] || '#52525b';

  const handleCopy = () => {
    if (node.output) {
      navigator.clipboard.writeText(node.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Improved Markdown-lite renderer
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-[13px] font-bold text-white mt-6 mb-3 uppercase tracking-wider">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-5 text-[12px] text-zinc-300 list-disc mb-1.5">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('```')) {
        return null; // Skip raw markers, container already handles mono
      }
      return <p key={i} className="text-[12px] text-zinc-300 leading-relaxed mb-2.5">{line}</p>;
    });
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-[#050505]/95 backdrop-blur-3xl border-l border-white/5 z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500 ease-out">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}></div>
          <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Agent Insight Matrix</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-light text-white tracking-tight">{node.label}</h2>
              <p className="text-[10px] text-zinc-600 font-mono tracking-tighter uppercase">{node.id}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-black uppercase tracking-widest">
              P{node.priority}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Runtime Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${node.status === AgentStatus.COMPLETED ? 'bg-emerald-500' : node.status === AgentStatus.FAILED ? 'bg-red-500' : 'bg-purple-500 animate-pulse'}`}></div>
                <p className={`text-xs font-black tracking-widest uppercase ${
                  node.status === AgentStatus.COMPLETED ? 'text-emerald-400' :
                  node.status === AgentStatus.FAILED ? 'text-red-400' : 'text-purple-400'
                }`}>
                  {node.status}
                </p>
              </div>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Ecosystem Role</p>
              <p className="text-xs font-bold text-zinc-200 tracking-wide">{node.type}</p>
            </div>
          </div>
        </div>

        {node.dependencies.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Execution Blockers</h3>
            <div className="flex flex-wrap gap-2">
              {node.dependencies.map(dep => (
                <span key={dep} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-zinc-400 mono font-bold hover:bg-white/10 transition-colors cursor-default">
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Agent Output Stream</h3>
            {node.output && (
              <button 
                onClick={handleCopy} 
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${copied ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-200'}`}>
                  {copied ? 'Copied' : 'Copy All'}
                </span>
                <svg className={`w-3.5 h-3.5 ${copied ? 'text-emerald-400' : 'text-zinc-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex-1 min-h-[350px] bg-[#080808] rounded-2xl border border-white/5 relative overflow-hidden flex flex-col group shadow-inner">
             {node.output ? (
               <div className="w-full h-full p-6 overflow-y-auto select-text custom-scrollbar focus:outline-none">
                 {node.output.includes('```') || node.type === AgentType.CODER ? (
                    <div className="font-mono text-[12px] leading-relaxed">
                      {renderContent(node.output)}
                    </div>
                 ) : (
                    <div className="text-[12px] text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap break-words selection:bg-purple-500/30">
                      {node.output}
                    </div>
                 )}
               </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-20">
                 <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-600 animate-spin-slow"></div>
                 <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Awaiting Handoff</p>
               </div>
             )}
             
             {/* Dynamic Status Bar for ongoing tasks */}
             {(node.status === AgentStatus.THINKING || node.status === AgentStatus.EXECUTING) && (
               <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 animate-loading-bar"></div>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-6 pb-6">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Telemetry Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Compute Latency', value: node.status === AgentStatus.COMPLETED ? '1.42s' : '---', progress: 85 },
              { label: 'Token Density', value: node.status === AgentStatus.COMPLETED ? '1,280' : '---', progress: 62 },
              { label: 'Decision Confidence', value: node.status === AgentStatus.COMPLETED ? '99.4%' : '---', progress: 94 },
            ].map((m, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-600 font-bold uppercase tracking-tighter">{m.label}</span>
                  <span className="text-zinc-300 font-mono font-bold">{m.value}</span>
                </div>
                <div className="h-1 bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                   <div 
                    className="h-full bg-zinc-600 transition-all duration-1000 ease-out" 
                    style={{ width: node.status === AgentStatus.COMPLETED ? `${m.progress}%` : '0%' }}
                   ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <button className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-black uppercase rounded-xl border border-white/10 transition-all tracking-[0.3em] active:scale-[0.98]">
          View Detailed Trace Log
        </button>
      </div>

      <style>{`
        @keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-loading-bar { animation: loading-bar 2s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default AgentDetails;
