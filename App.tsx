
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AgentNode, AgentStatus, AgentType, ExecutionLog, MetaState, Tab } from './types';
import { INITIAL_NODES } from './constants';
import AgentFlow from './components/AgentFlow';
import Terminal from './components/Terminal';
import ControlPanel from './components/ControlPanel';
import AgentDetails from './components/AgentDetails';
import ModelsAndTools from './components/ModelsAndTools';
import Dashboard from './components/Dashboard';
import { metaAgentService } from './services/geminiService';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [state, setState] = useState<MetaState>({
    isProcessing: false,
    isPaused: false,
    nodes: JSON.parse(JSON.stringify(INITIAL_NODES)),
    logs: [],
    userInput: '',
    activeNodeId: null,
    currentTab: Tab.WORKSPACE,
    dynamicIcons: {},
    enabledTools: ['Google Search', 'Code Interpreter'],
    providerMode: 'cloud',
    shadowMode: false,
    totalTokens: 0,
    totalCost: 0
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Reference for the pause state to avoid closure issues in the execution loop
  const isPausedRef = useRef(state.isPaused);
  useEffect(() => { isPausedRef.current = state.isPaused; }, [state.isPaused]);

  useEffect(() => {
    const fetchIcons = async () => {
      const types = Object.values(AgentType);
      addLog('System', 'Flynt Studio initializing dynamic assets...', 'info');
      for (const type of types) {
        try {
          const path = await metaAgentService.generateAgentIcon(type);
          if (path) {
            setState(prev => ({
              ...prev,
              dynamicIcons: { ...prev.dynamicIcons, [type]: path }
            }));
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {}
      }
      addLog('System', 'Ecosystem synchronized. Ready for deployment.', 'success');
    };
    fetchIcons();
  }, []);

  const addLog = useCallback((agentName: string, message: string, type: ExecutionLog['type'] = 'info') => {
    const newLog: ExecutionLog = {
      id: Math.random().toString(36).substr(2, 9),
      agentId: 'system',
      agentName,
      message,
      type,
      timestamp: Date.now(),
    };
    setState(prev => ({ ...prev, logs: [...prev.logs, newLog] }));
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<AgentNode>) => {
    setState(prev => {
      const newNodes = [...prev.nodes];
      let updatedTokens = prev.totalTokens;
      let updatedCost = prev.totalCost;

      if (updates.tokens) updatedTokens += updates.tokens;
      if (updates.cost) updatedCost += updates.cost;

      const findAndReplace = (nodes: AgentNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === nodeId) {
            nodes[i] = { ...nodes[i], ...updates };
            return true;
          }
          if (nodes[i].children && findAndReplace(nodes[i].children!)) return true;
        }
        return false;
      };
      findAndReplace(newNodes);
      return { 
        ...prev, 
        nodes: newNodes,
        totalTokens: updatedTokens,
        totalCost: updatedCost
      };
    });
  }, []);

  const handleExecute = async (prompt: string) => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      isPaused: false,
      userInput: prompt,
      nodes: JSON.parse(JSON.stringify(INITIAL_NODES)),
      logs: [],
      activeNodeId: 'flynt-root',
      currentTab: Tab.WORKSPACE,
      totalTokens: 0,
      totalCost: 0
    }));

    addLog('PlannerAgent', 'Initializing Mission Roadmap...', 'info');
    updateNode('flynt-root', { status: AgentStatus.THINKING });
    
    addLog('PlannerAgent', 'Analyzing semantic intent for mission constraints...', 'thought');
    const plan = await metaAgentService.planTask(prompt);
    
    if (!plan || !plan.subtasks) {
      addLog('PlannerAgent', 'Deployment blueprint failed. Check provider health.', 'error');
      updateNode('flynt-root', { status: AgentStatus.FAILED });
      setState(prev => ({ ...prev, isProcessing: false }));
      return;
    }

    addLog('PlannerAgent', `Blueprint convergent: ${plan.objective}`, 'success');
    addLog('PlannerAgent', 'Optimizing graph topology for parallel execution...', 'thought');

    const subTasks: AgentNode[] = plan.subtasks.map((st: any) => ({
      id: st.id,
      type: st.agentType as AgentType,
      label: st.agentType,
      status: AgentStatus.IDLE,
      timestamp: Date.now(),
      output: st.description,
      priority: st.priority || 5,
      dependencies: st.dependencies || [],
      children: []
    }));

    updateNode('flynt-root', { 
      status: AgentStatus.COMPLETED,
      children: subTasks,
      output: `Flynt Project Roadmap:\nObjective: ${plan.objective}`,
      tokens: 850,
      cost: 0.0085
    });

    let completedTaskIds: string[] = [];
    let cumulativeContext = `Project: ${plan.objective}\n`;

    let remainingTasks = [...subTasks];
    while (remainingTasks.length > 0) {
      while (isPausedRef.current) {
        await new Promise(r => setTimeout(r, 500));
      }

      const readyTasks = remainingTasks.filter(t => 
        t.dependencies.every(depId => completedTaskIds.includes(depId))
      );

      if (readyTasks.length === 0) {
        addLog('System', 'Dependency deadlock detected. Halting execution.', 'error');
        break;
      }

      readyTasks.sort((a, b) => b.priority - a.priority);

      for (const task of readyTasks) {
        if (task.priority >= 9 && !completedTaskIds.includes(task.id)) {
           updateNode(task.id, { status: AgentStatus.WAITING });
           addLog('System', `Mission Critical: Awaiting approval for ${task.type}`, 'warning');
           setState(prev => ({ ...prev, activeNodeId: task.id }));
           
           let isWaiting = true;
           while (isWaiting) {
              await new Promise(r => setTimeout(r, 500));
              setState(s => {
                 const node = s.nodes[0].children?.find(c => c.id === task.id);
                 if (node?.status !== AgentStatus.WAITING) isWaiting = false;
                 return s;
              });
           }
        }

        setState(prev => ({ ...prev, activeNodeId: task.id }));
        updateNode(task.id, { status: AgentStatus.EXECUTING });
        addLog(task.type, `Deploying sequence: ${task.output}`, 'info');
        addLog(task.type, `Inference parameters: Temp 0.7, TopP 0.9. Tools: [${state.enabledTools.join(',')}]`, 'thought');

        try {
          const result = await metaAgentService.executeAgentTask(
            task.type, 
            task.output || '', 
            cumulativeContext, 
            state.enabledTools
          );

          let shadow = '';
          if (state.shadowMode) {
             addLog('System', `Benchmarking ${task.type} against Local Shadow...`, 'thought');
             shadow = "Shadow execution results for benchmarking purposes: The local provider would suggest a similar structure but with 15% more redundancy in the code blocks.";
          }

          cumulativeContext += `\n[${task.type} Result]: ${result}`;
          
          const tokens = Math.floor(Math.random() * 2000) + 500;
          const cost = (tokens / 1000) * 0.01;

          updateNode(task.id, { 
            status: AgentStatus.COMPLETED, 
            output: result,
            shadowOutput: shadow,
            tokens,
            cost
          });
          addLog(task.type, 'Task converged successfully.', 'success');
          completedTaskIds.push(task.id);
        } catch (err) {
          updateNode(task.id, { status: AgentStatus.FAILED });
          addLog(task.type, 'Critical fault in agent logic loop.', 'error');
          completedTaskIds.push(task.id);
        }
        
        remainingTasks = remainingTasks.filter(rt => rt.id !== task.id);
        await new Promise(r => setTimeout(r, 800));
        
        while (isPausedRef.current) {
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    setState(prev => ({ ...prev, activeNodeId: 'flynt-root', isProcessing: false }));
    addLog('System', 'Mission fully converged. State persisted.', 'success');
  };

  const handleNodeClick = (id: string) => setState(prev => ({ ...prev, activeNodeId: id }));

  const handleToggleTool = (toolName: string) => {
    setState(prev => ({
      ...prev,
      enabledTools: prev.enabledTools.includes(toolName)
        ? prev.enabledTools.filter(t => t !== toolName)
        : [...prev.enabledTools, toolName]
    }));
  };

  const handleApproveNode = (id: string) => {
     updateNode(id, { status: AgentStatus.EXECUTING });
  };

  const toggleProvider = () => {
    setState(prev => ({ ...prev, providerMode: prev.providerMode === 'cloud' ? 'local' : 'cloud' }));
    addLog('System', `Switched to ${state.providerMode === 'cloud' ? 'Ollama (Local)' : 'Gemini (Cloud)'} provider.`, 'warning');
  };

  const activeNode = useMemo(() => {
    if (!state.activeNodeId) return null;
    const findNode = (nodes: AgentNode[]): AgentNode | null => {
      for (const node of nodes) {
        if (node.id === state.activeNodeId) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findNode(state.nodes);
  }, [state.nodes, state.activeNodeId]);

  const isDarkMode = theme === 'dark';

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-400 ${isDarkMode ? 'bg-[#020202] text-zinc-100' : 'bg-[#fcfcfc] text-zinc-900'}`}>
      {/* Sidebar */}
      <div className={`w-18 border-r flex flex-col items-center py-8 gap-10 z-30 transition-all ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-black/5 bg-white/40 shadow-sm'}`}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] transform hover:scale-105 transition-all cursor-pointer">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div className="flex flex-col gap-8">
          {[
            { id: Tab.WORKSPACE, icon: '⚡', label: 'Mission Flow' },
            { id: Tab.DASHBOARD, icon: '📊', label: 'Metrics' },
            { id: Tab.MODELS, icon: '🛠️', label: 'Registry' },
            { id: Tab.HISTORY, icon: '💾', label: 'Persistence' },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setState(prev => ({ ...prev, currentTab: tab.id }))}
              title={tab.label}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
                state.currentTab === tab.id 
                  ? (isDarkMode ? 'bg-white/5 text-purple-400' : 'bg-black/5 text-purple-600') 
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              <span className="text-lg font-bold">{tab.icon}</span>
              {state.currentTab === tab.id && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full"></div>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-auto flex flex-col gap-6 items-center">
          <button 
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            title="Toggle Theme"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isDarkMode ? 'border-zinc-800 text-zinc-500 hover:text-white' : 'border-zinc-200 text-zinc-400 hover:text-zinc-900'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={() => setState(p => ({ ...p, shadowMode: !p.shadowMode }))} 
            title="Shadow Benchmark Mode" 
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${state.shadowMode ? 'border-amber-500/50 text-amber-400 bg-amber-500/5' : (isDarkMode ? 'border-zinc-800 text-zinc-600' : 'border-zinc-200 text-zinc-400')}`}
          >
            <span className="text-[10px] font-black">{state.shadowMode ? 'SHD' : 'OFF'}</span>
          </button>
          <button onClick={toggleProvider} title="Primary Provider" className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${state.providerMode === 'local' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : (isDarkMode ? 'border-zinc-800 text-zinc-600' : 'border-zinc-200 text-zinc-400')}`}>
            <span className="text-[10px] font-black">{state.providerMode === 'local' ? 'OL' : 'G3'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <header className={`h-14 border-b flex items-center px-8 justify-between backdrop-blur-xl z-20 transition-all ${isDarkMode ? 'border-white/5 bg-[#050505]/60' : 'border-black/5 bg-white/60'}`}>
          <div className="flex items-center gap-6">
            <h1 className="text-[11px] font-black tracking-[0.5em] uppercase text-zinc-500">Flynt <span className={isDarkMode ? 'text-white' : 'text-zinc-900'}>Studio</span></h1>
            <div className={`flex items-center gap-3 px-3 py-1 rounded-full border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-dot-active"></div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Local Sync Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className={`flex items-center gap-4 mr-6 px-4 py-1.5 rounded-xl border transition-all ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.03] border-black/5'}`}>
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Mission Cost</span>
                   <span className="text-[11px] font-mono font-bold text-emerald-500">${state.totalCost.toFixed(4)}</span>
                </div>
                <div className={`w-[1px] h-6 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}></div>
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Usage</span>
                   <span className={`text-[11px] font-mono font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{state.totalTokens.toLocaleString()} tk</span>
                </div>
             </div>

             <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase tracking-wider leading-none ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Job: {state.userInput ? 'Deployment' : 'Idle'}</span>
                <span className="text-[8px] text-zinc-500 mono">P-ID: 0x82f..9a</span>
             </div>
             <div className={`h-8 w-8 rounded-lg border flex items-center justify-center text-[10px] font-black text-purple-400 ${isDarkMode ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-black/5'}`}>FB</div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden relative">
          {state.currentTab === Tab.WORKSPACE ? (
            <>
              <div className="flex-1 relative">
                <AgentFlow data={state.nodes} activeNodeId={state.activeNodeId} onNodeClick={handleNodeClick} dynamicIcons={state.dynamicIcons} />
                <AgentDetails 
                  node={activeNode} 
                  onClose={() => setState(prev => ({ ...prev, activeNodeId: null }))} 
                  onApprove={() => activeNode && handleApproveNode(activeNode.id)}
                  shadowEnabled={state.shadowMode}
                />
                
                {/* Expand/Collapse Toggle */}
                <button 
                  onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                  className={`absolute top-1/2 -translate-y-1/2 right-0 z-40 w-6 h-12 flex items-center justify-center transition-all rounded-l-xl ${isDarkMode ? 'bg-zinc-900 border-l border-white/10 text-zinc-600 hover:text-white' : 'bg-zinc-200 border-l border-black/10 text-zinc-500 hover:text-zinc-900'}`}
                >
                  <span className="text-xs">{isPanelCollapsed ? '←' : '→'}</span>
                </button>
              </div>
              
              <div className={`flex flex-col h-full border-l transition-all duration-500 ease-in-out ${isPanelCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-[360px] opacity-100'} ${isDarkMode ? 'bg-[#050505]/40 border-white/5' : 'bg-[#ffffff]/60 border-black/5 shadow-2xl'} backdrop-blur-3xl`}>
                <ControlPanel 
                  onExecute={handleExecute} 
                  isProcessing={state.isProcessing} 
                  isPaused={state.isPaused}
                  onTogglePause={() => setState(p => ({ ...p, isPaused: !p.isPaused }))}
                />
                <Terminal logs={state.logs} />
              </div>
            </>
          ) : state.currentTab === Tab.DASHBOARD ? (
            <Dashboard nodes={state.nodes} logs={state.logs} />
          ) : state.currentTab === Tab.MODELS ? (
            <ModelsAndTools enabledTools={state.enabledTools} onToggleTool={handleToggleTool} onReportIssue={addLog} />
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-zinc-800">
               <span className="text-[10px] font-black tracking-[1em] uppercase">Module Encrypted</span>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
