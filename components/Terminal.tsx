
import React, { useEffect, useRef, useState } from 'react';
import { ExecutionLog } from '../types';

interface TerminalProps {
  logs: ExecutionLog[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyAll = () => {
    if (logs.length > 0) {
      const formattedLogs = logs.map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `[${time}] [${log.agentName}] ${log.message}`;
      }).join('\n');
      
      navigator.clipboard.writeText(formattedLogs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border-t border-zinc-900/50 mono text-[10px] relative">
      <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-900/40 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></div>
          <span className="text-zinc-500 font-black uppercase tracking-[0.3em]">System.logs</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCopyAll}
            className="text-[8px] font-black uppercase text-zinc-600 hover:text-white transition-colors tracking-widest"
          >
            {copied ? 'Captured' : 'Export Buffer'}
          </button>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
          </div>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-1.5 custom-scrollbar selection:bg-purple-500/30"
      >
        {logs.map((log) => {
          const isThought = log.type === 'thought';
          return (
            <div key={log.id} className={`flex gap-3 leading-relaxed transition-all duration-300 ${isThought ? 'opacity-40 hover:opacity-100 italic' : ''}`}>
              <span className="text-zinc-700 shrink-0 font-mono text-[9px]">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={`shrink-0 font-black uppercase tracking-tighter ${
                isThought ? 'text-purple-400' :
                log.type === 'error' ? 'text-red-500' : 
                log.type === 'warning' ? 'text-amber-500' : 
                log.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
              }`}>
                {isThought ? 'monologue' : `[${log.agentName}]`}
              </span>
              <span className={`${isThought ? 'text-zinc-500' : 'text-zinc-300'}`}>
                {log.message}
              </span>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-zinc-700 font-black uppercase tracking-[0.4em] py-10 text-center animate-pulse">
            Idle Link Interface
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
