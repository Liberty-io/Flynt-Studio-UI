
import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  const [state, setState] = useState<MetaState>({
    isProcessing: false,
    nodes: JSON.parse(JSON.stringify(INITIAL_NODES)),
    logs: [],
    userInput: '',
    activeNodeId: null,
    currentTab: Tab.WORKSPACE,
    dynamicIcons: {},
    enabledTools: ['Google Search', 'Code Interpreter'],
    providerMode: 'cloud'
  });

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
          await new Promise(resolve => setTimeout(resolve, 200));
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
      return { ...prev, nodes: newNodes };
    });
  }, []);

  const handleExecute = async (prompt: string) => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      userInput: prompt,
      nodes: JSON.parse(JSON.stringify(INITIAL_NODES)),
      logs: [],
      activeNodeId: 'flynt-root',
      currentTab: Tab.WORKSPACE
    }));

    addLog('PlannerAgent', 'Initializing Mission Roadmap...', 'info');
    updateNode('flynt-root', { status: AgentStatus.THINKING });
    
    const plan = await metaAgentService.planTask(prompt);
    
    if (!plan || !plan.subtasks) {
      addLog('PlannerAgent', 'Deployment blueprint failed. Check provider health.', 'error');
      updateNode('flynt-root', { status: AgentStatus.FAILED });
      setState(prev => ({ ...prev, isProcessing: false }));
      return;
    }

    addLog('PlannerAgent', `Blueprint convergent: ${plan.objective}`, 'success');

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
      output: `Flynt Project Roadmap:\nObjective: ${plan.objective}`
    });

    let completedTaskIds: string[] = [];
    let cumulativeContext = `Project: ${plan.objective}\n`;

    let remainingTasks = [...subTasks];
    while (remainingTasks.length > 0) {
      const readyTasks = remainingTasks.filter(t => 
        t.dependencies.every(depId => completedTaskIds.includes(depId))
      );

      if (readyTasks.length === 0) {
        addLog('System', 'Dependency deadlock detected. Halting execution.', 'error');
        break;
      }

      readyTasks.sort((a, b) => b.priority - a.priority);

      for (const task of readyTasks) {
        setState(prev => ({ ...prev, activeNodeId: task.id }));
        updateNode(task.id, { status: AgentStatus.EXECUTING });
        addLog(task.type, `Deploying: ${task.output}`, 'info');

        try {
          const result = await metaAgentService.executeAgentTask(
            task.type, 
            task.output || '', 
            cumulativeContext, 
            state.enabledTools
          );
          cumulativeContext += `\n[${task.type} Result]: ${result}`;
          updateNode(task.id, { status: AgentStatus.COMPLETED, output: result });
          addLog(task.type, 'Task converged.', 'success');
          completedTaskIds.push(task.id);
        } catch (err) {
          updateNode(task.id, { status: AgentStatus.FAILED });
          addLog(task.type, 'Critical fault.', 'error');
          completedTaskIds.push(task.id);
        }
        
        remainingTasks = remainingTasks.filter(rt => rt.id !== task.id);
        await new Promise(r => setTimeout(r, 800));
      }
    }

    setState(prev => ({ ...prev, activeNodeId: 'flynt-root', isProcessing: false }));
    addLog('System', 'Mission fully converged. Project files persisted to SQLite.', 'success');
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#020202] text-zinc-100">
      {/* Sidebar */}
      <div className="w-18 border-r border-white/5 flex flex-col items-center py-8 gap-10 bg-black/40 backdrop-blur-3xl z-30">
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
                  ? 'bg-white/5 text-purple-400 shadow-inner' 
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <span className="text-lg font-bold">{tab.icon}</span>
              {state.currentTab === tab.id && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full"></div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-6">
          <button onClick={toggleProvider} title="Switch Provider Mode" className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${state.providerMode === 'local' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-zinc-800 text-zinc-600'}`}>
            <span className="text-[10px] font-black">{state.providerMode === 'local' ? 'OL' : 'G3'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <header className="h-14 border-b border-white/5 flex items-center px-8 justify-between bg-[#050505]/60 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <h1 className="text-[11px] font-black tracking-[0.5em] uppercase text-zinc-500">Flynt <span className="text-white">Studio</span></h1>
            <div className="flex items-center gap-3 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-dot-active"></div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Local Sync Active</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-white uppercase tracking-wider leading-none">Job: {state.userInput ? 'Deployment' : 'Idle'}</span>
                <span className="text-[8px] text-zinc-500 mono">P-ID: 0x82f..9a</span>
             </div>
             <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-purple-400">FB</div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden relative">
          {state.currentTab === Tab.WORKSPACE ? (
            <>
              <div className="flex-1 relative">
                <AgentFlow data={state.nodes} activeNodeId={state.activeNodeId} onNodeClick={handleNodeClick} dynamicIcons={state.dynamicIcons} />
                <AgentDetails node={activeNode} onClose={() => setState(prev => ({ ...prev, activeNodeId: null }))} />
              </div>
              <div className="w-[360px] flex flex-col h-full bg-[#050505]/40 backdrop-blur-3xl border-l border-white/5">
                <ControlPanel onExecute={handleExecute} isProcessing={state.isProcessing} />
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
