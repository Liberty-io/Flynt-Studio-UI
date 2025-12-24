
import React, { useMemo, useState } from 'react';
import { AgentNode, AgentStatus, ExecutionLog, AgentType } from '../types';
import { COLORS } from '../constants';

interface DashboardProps {
  nodes: AgentNode[];
  logs: ExecutionLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ nodes, logs }) => {
  const [activeMatrixCell, setActiveMatrixCell] = useState<{from: string, to: string} | null>(null);

  // 1. System Health Metrics
  const systemHealth = useMemo(() => {
    return [
      { name: 'LLM Gateway', status: 'Optimal', details: 'Gemini-3 Pro v2', latency: '450ms', type: 'cloud' },
      { name: 'Local Provider', status: 'Standby', details: 'Ollama Llama3.2', latency: 'N/A', type: 'local' },
      { name: 'State Manager', status: 'Healthy', details: 'SQLite (WAL Mode)', storage: '12.4 MB', type: 'core' },
      { name: 'Exec Engine', status: nodes.some(n => n.status === AgentStatus.EXECUTING) ? 'Active' : 'Idle', details: 'Sandboxed V8', threads: '4/8', type: 'core' },
    ];
  }, [nodes]);

  // 2. Task Lifecycle Data (Timeline)
  const taskTimeline = useMemo(() => {
    const allNodes: AgentNode[] = [];
    const flatten = (items: AgentNode[]) => {
      items.forEach(node => {
        if (node.id !== 'flynt-root') allNodes.push(node);
        if (node.children) flatten(node.children);
      });
    };
    flatten(nodes);
    return allNodes.sort((a, b) => a.timestamp - b.timestamp);
  }, [nodes]);

  // 3. Communication Matrix (Heatmap Data)
  const commMatrix = useMemo(() => {
    const agentNames = Object.values(AgentType);
    const matrix: Record<string, Record<string, number>> = {};
    
    agentNames.forEach(a => {
      matrix[a] = {};
      agentNames.forEach(b => matrix[a][b] = 0);
    });

    // In this framework, "Communication" is inferred from logs where agents hand off or share context.
    // For visualization purposes, we map log frequency per agent as "intensity".
    logs.forEach(log => {
      if (matrix[log.agentName]) {
        // Self-intensity represents activity, cross-intensity represents interaction
        matrix[log.agentName][log.agentName] += 1;
      }
    });

    return { agentNames, matrix };
  }, [logs]);

  const maxComm = useMemo(() => {
    let max = 1;
    Object.values(commMatrix.matrix).forEach(row => {
      Object.values(row).forEach(val => { if (val > max) max = val; });
    });
    return max;
  }, [commMatrix]);

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-[#020202] animate-in fade-in duration-700 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-light tracking-tight text-white">System <span className="text-zinc-500">Analytics</span></h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-600">Flynt Studio Environment v1.0.4</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex flex-col items-end">
               <span className="text-[8px] font-black text-zinc-600 uppercase">Mission Uptime</span>
               <span className="text-xs font-mono text-zinc-300">04:12:33:09</span>
            </div>
          </div>
        </div>

        {/* 1. System Health Grid */}
        <section className="space-y-4">
           <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Core Framework Health</h2>
              <div className="h-[1px] flex-1 bg-white/5"></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {systemHealth.map((module) => (
                <div key={module.name} className="p-4 rounded-2xl material-surface border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{module.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${module.status === 'Optimal' || module.status === 'Healthy' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`}></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{module.details}</p>
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>{module.latency || module.storage || module.threads}</span>
                      <span className="uppercase">{module.status}</span>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. Task Lifecycle Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Deployment Lifecycle</h2>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>
            <div className="material-surface rounded-2xl border border-white/5 p-8 min-h-[450px]">
              {taskTimeline.length > 0 ? (
                <div className="relative pl-8 border-l border-white/5 space-y-10 py-2">
                  {taskTimeline.map((task, i) => (
                    <div key={task.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-[#020202] z-10 transition-transform group-hover:scale-125 ${
                        task.status === AgentStatus.COMPLETED ? 'bg-emerald-500' : 
                        task.status === AgentStatus.FAILED ? 'bg-red-500' : 'bg-purple-500 animate-pulse'
                      }`}></div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-white tracking-widest">{task.label}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-mono">P{task.priority}</span>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-mono uppercase">{new Date(task.timestamp).toLocaleTimeString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                task.status === AgentStatus.COMPLETED ? 'bg-emerald-500/40' : 
                                task.status === AgentStatus.FAILED ? 'bg-red-500/40' : 'bg-purple-500/40'
                              }`} 
                              style={{ width: task.status === AgentStatus.COMPLETED ? '100%' : '40%' }}
                            ></div>
                          </div>
                          <span className={`text-[9px] font-black uppercase ${
                             task.status === AgentStatus.COMPLETED ? 'text-emerald-500' : 
                             task.status === AgentStatus.FAILED ? 'text-red-500' : 'text-purple-500'
                          }`}>{task.status}</span>
                        </div>
                        
                        <p className="text-[10px] text-zinc-500 line-clamp-1 group-hover:line-clamp-none transition-all cursor-default">
                          {task.output?.substring(0, 120)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">System awaiting roadmap initialization</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Agent Communication Matrix (Heatmap) */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Handoff Intensity</h2>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>
            <div className="material-surface rounded-2xl border border-white/5 p-6 flex flex-col min-h-[450px]">
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-6 gap-1 mb-2">
                  <div className="col-span-1"></div>
                  {commMatrix.agentNames.slice(0, 5).map(name => (
                    <div key={name} className="text-[7px] text-zinc-600 uppercase font-black text-center truncate" title={name}>
                      {name.replace('Agent', '')}
                    </div>
                  ))}
                </div>
                
                <div className="flex-1 space-y-1">
                  {commMatrix.agentNames.slice(0, 5).map(rowName => (
                    <div key={rowName} className="grid grid-cols-6 gap-1 items-center h-12">
                      <div className="text-[7px] text-zinc-600 uppercase font-black pr-2 text-right truncate" title={rowName}>
                        {rowName.replace('Agent', '')}
                      </div>
                      {commMatrix.agentNames.slice(0, 5).map(colName => {
                        const val = commMatrix.matrix[rowName][colName];
                        const opacity = val === 0 ? 0.05 : 0.1 + (val / maxComm) * 0.9;
                        return (
                          <div 
                            key={colName}
                            onMouseEnter={() => setActiveMatrixCell({from: rowName, to: colName})}
                            onMouseLeave={() => setActiveMatrixCell(null)}
                            className="aspect-square rounded-md border border-white/5 relative group cursor-crosshair transition-all hover:scale-105"
                            style={{ 
                              backgroundColor: `rgba(168, 85, 247, ${opacity})`,
                              boxShadow: val > 0 ? `inset 0 0 10px rgba(168, 85, 247, ${opacity / 2})` : 'none'
                            }}
                          >
                            {val > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="text-[8px] font-mono font-bold text-white">{val}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                <div className="h-20 bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col justify-center">
                  {activeMatrixCell ? (
                    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-1">
                      <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Protocol Metadata</p>
                      <p className="text-[10px] text-white font-bold">{activeMatrixCell.from} → {activeMatrixCell.to}</p>
                      <p className="text-[9px] text-zinc-500 font-mono">Intensity Score: {commMatrix.matrix[activeMatrixCell.from][activeMatrixCell.to]}</p>
                    </div>
                  ) : (
                    <p className="text-[9px] text-zinc-700 font-medium italic text-center">Hover matrix nodes for telemetry data</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-[8px] font-black text-zinc-600 uppercase tracking-tighter">
                  <span>Idle</span>
                  <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-purple-500/5 to-purple-500 rounded-full"></div>
                  <span>High Load</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
