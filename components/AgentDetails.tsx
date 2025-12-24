
import React, { useState } from 'react';
import { AgentNode, AgentStatus, AgentType } from '../types';
import { COLORS } from '../constants';

interface AgentDetailsProps {
  node: AgentNode | null;
  onClose: () => void;
  onApprove?: () => void;
  shadowEnabled?: boolean;
}

const AgentDetails: React.FC<AgentDetailsProps> = ({ node, onClose, onApprove, shadowEnabled }) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'output' | 'shadow' | 'telemetry'>('output');

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

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
        return (
          <div key={i} className="my-6 rounded-2xl overflow-hidden border border-white/10 bg-black/80 group/code relative shadow-2xl">
            <div className="flex items-center justify-between px-5 py-2.5 bg-white/5 border-b border-white/5">
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Code Fragment
               </span>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(code);
                   setCopied(true);
                   setTimeout(() => setCopied(false), 2000);
                 }}
                 className="opacity-0 group-hover/code:opacity-100 transition-opacity text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest"
               >
                 {copied ? 'Copied' : 'Copy Block'}
               </button>
            </div>
            <pre className="p-6 overflow-x-auto text-[13px] font-mono leading-relaxed text-zinc-100 selection:bg-purple-500/50">
               <code className="block">{code.trim()}</code>
            </pre>
          </div>
        );
      }

      return part.split('\n').map((line, j) => {
        if (!line.trim()) return <div key={`${i}-${j}`} className="h-4" />;
        
        if (line.startsWith('### ')) {
          return <h3 key={`${i}-${j}`} className="text-[13px] font-black text-white mt-8 mb-4 uppercase tracking-[0.2em] border-b border-white/5 pb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={`${i}-${j}`} className="ml-5 text-[13px] text-zinc-300 font-mono list-none mb-3 flex items-start gap-3">
            <span className="text-purple-500 mt-1">▹</span> {line.replace('- ', '')}
          </li>;
        }
        // Citations
        if (line.match(/^\[.*\]\(.*\)/)) {
           return <a key={`${i}-${j}`} href={line.match(/\((.*)\)/)?.[1]} target="_blank" className="text-purple-400 hover:text-purple-300 underline text-xs font-mono block mb-2">{line.match(/\[(.*)\]/)?.[1]}</a>;
        }
        
        const highlightedLine = line.replace(
          /\b(const|let|var|function|return|if|else|import|export|from|class|await|async|def|class|print|for|in)\b/g,
          '<span class="text-purple-400 font-bold">$1</span>'
        ).replace(
          /\b(true|false|null|undefined|None)\b/g,
          '<span class="text-amber-400 font-bold">$1</span>'
        ).replace(
          /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
          '<span class="text-emerald-400">$1</span>'
        );

        return (
          <p 
            key={`${i}-${j}`} 
            className="text-[13px] text-zinc-400 leading-relaxed mb-4 font-mono selection:bg-purple-500/50"
            dangerouslySetInnerHTML={{ __html: highlightedLine }}
          />
        );
      });
    });
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[520px] bg-[#050505]/98 backdrop-blur-3xl border-l border-white/10 z-50 flex flex-col shadow-[-40px_0_80px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-500 ease-out">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}` }}></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Node Intelligence</span>
            <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">{node.type}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-zinc-600 hover:text-white transition-all">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
        <header className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-light text-white tracking-tight">{node.label}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-zinc-700 bg-white/5 px-2 py-0.5 rounded border border-white/5">{node.id}</span>
                <span className="text-[9px] font-mono text-zinc-600 uppercase">Priority P{node.priority}</span>
              </div>
            </div>
            {node.status === AgentStatus.WAITING && (
               <div className="px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/50 text-[10px] text-amber-500 font-black uppercase tracking-widest animate-pulse">
                  Approval Required
               </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 bg-white/[0.03] rounded-3xl border border-white/5 backdrop-blur-sm">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Live Status</p>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${node.status === AgentStatus.COMPLETED ? 'bg-emerald-500' : node.status === AgentStatus.WAITING ? 'bg-amber-500 animate-pulse' : 'bg-purple-500 animate-pulse'}`}></div>
                <p className={`text-xs font-black tracking-[0.2em] uppercase ${
                  node.status === AgentStatus.COMPLETED ? 'text-emerald-400' :
                  node.status === AgentStatus.WAITING ? 'text-amber-400' : 'text-purple-400'
                }`}>
                  {node.status}
                </p>
              </div>
            </div>
            <div className="p-5 bg-white/[0.03] rounded-3xl border border-white/5 backdrop-blur-sm">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Node Metrics</p>
              <p className="text-xs font-bold text-zinc-200 tracking-wide mono">{node.tokens || 0} tk | ${node.cost?.toFixed(4) || '0.00'}</p>
            </div>
          </div>
        </header>

        {/* Human in the loop controls */}
        {node.status === AgentStatus.WAITING && (
           <div className="space-y-4 p-8 bg-amber-500/5 border border-amber-500/20 rounded-3xl animate-in zoom-in-95">
              <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em]">Critical Protocol Intercept</h4>
              <p className="text-[12px] text-zinc-400 leading-relaxed font-mono">
                The PlannerAgent has flagged this sequence as mission-critical. Please review the task description below and authorize the next phase.
              </p>
              <div className="flex gap-4 pt-2">
                 <button 
                  onClick={onApprove}
                  className="flex-1 py-3 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                 >
                   Authorize Protocol
                 </button>
                 <button className="px-6 py-3 bg-zinc-900 border border-white/5 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                   Abort
                 </button>
              </div>
           </div>
        )}

        <div className="space-y-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-4">
               <button 
                 onClick={() => setActiveView('output')}
                 className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'output' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
               >
                 Main Stream
               </button>
               {shadowEnabled && (
                 <button 
                   onClick={() => setActiveView('shadow')}
                   className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'shadow' ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                 >
                   Shadow Bench
                 </button>
               )}
            </div>
            {node.output && (
              <button 
                onClick={handleCopy} 
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl border transition-all active:scale-95 ${
                  copied ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className={`text-[9px] font-black uppercase tracking-widest ${copied ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-200'}`}>
                  {copied ? 'Captured' : 'Export'}
                </span>
              </button>
            )}
          </div>
          
          <div className="flex-1 min-h-[400px] bg-[#080808] rounded-3xl border border-white/5 relative overflow-hidden flex flex-col group shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)]">
             <div className="w-full h-full p-8 overflow-y-auto select-text custom-scrollbar focus:outline-none scroll-smooth">
                {activeView === 'output' && renderContent(node.output || '')}
                {activeView === 'shadow' && renderContent(node.shadowOutput || 'Shadow benchmark data not available for this node.')}
                {!node.output && node.status !== AgentStatus.WAITING && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-30">
                     <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-500 animate-spin-slow"></div>
                     <p className="text-[11px] text-zinc-500 uppercase font-black tracking-[0.5em] animate-pulse">Inference Lock</p>
                   </div>
                )}
             </div>
             
             {(node.status === AgentStatus.THINKING || node.status === AgentStatus.EXECUTING) && (
               <div className="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 animate-loading-bar shadow-[0_-4px_15px_rgba(168,85,247,0.5)]"></div>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-8 pb-10">
          <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Agent Telemetry</h3>
          <div className="grid grid-cols-1 gap-6">
            {[
              { label: 'Reasoning Confidence', value: node.status === AgentStatus.COMPLETED ? '99.4%' : '---', progress: 94, color: 'text-emerald-400' },
              { label: 'Ecosystem Sync', value: node.status === AgentStatus.COMPLETED ? 'Active' : '---', progress: 100, color: 'text-zinc-300' },
              { label: 'Token Entropy', value: node.status === AgentStatus.COMPLETED ? '0.12' : '---', progress: 12, color: 'text-zinc-500' },
            ].map((m, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-600 font-bold uppercase tracking-widest">{m.label}</span>
                  <span className={`${m.color} font-mono font-bold`}>{m.value}</span>
                </div>
                <div className="h-1 bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                   <div 
                    className={`h-full bg-zinc-700 transition-all duration-1500 ease-out ${i === 0 ? 'bg-emerald-500/50' : ''}`} 
                    style={{ width: node.status === AgentStatus.COMPLETED ? `${m.progress}%` : '0%' }}
                   ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-loading-bar { animation: loading-bar 2.5s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        .selection\\:bg-purple-500\\/50 ::selection { background-color: rgba(168, 85, 247, 0.5) !important; color: white !important; }
      `}</style>
    </div>
  );
};

export default AgentDetails;
