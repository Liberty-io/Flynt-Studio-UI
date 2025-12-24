
import React, { useState, useMemo } from 'react';
import { ExecutionLog } from '../types';

const MODELS = [
  {
    name: 'Gemini 3 Pro',
    id: 'gemini-3-pro-preview',
    type: 'Reasoning',
    description: 'Advanced reasoning, coding, and multi-step complex tasks.',
    specs: { context: '2M+', modalities: 'Text, Code, Vision', performance: '99th' },
    status: 'High Performance'
  },
  {
    name: 'Gemini 3 Flash',
    id: 'gemini-3-flash-preview',
    type: 'Speed',
    description: 'Fast, efficient performance for high-volume summarization and Q&A.',
    specs: { context: '1M', modalities: 'Text, Vision', latency: 'Sub-100ms' },
    status: 'Active'
  },
  {
    name: 'Gemini 2.5 Native Audio',
    id: 'gemini-2.5-flash-native-audio-preview-09-2025',
    type: 'Audio',
    description: 'Low-latency, real-time voice and audio processing.',
    specs: { latency: '<500ms', modalities: 'Audio In/Out', sampleRate: '24kHz' },
    status: 'Real-time'
  },
  {
    name: 'Veo 3.1 Fast',
    id: 'veo-3.1-fast-generate-preview',
    type: 'Video',
    description: 'High-quality cinematic video generation from text/image prompts.',
    specs: { resolution: '1080p', fps: '24/30', maxDuration: '60s' },
    status: 'Experimental'
  }
];

type ToolStatus = 'online' | 'offline' | 'maintenance';

interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  status: ToolStatus;
  maintenanceSchedule?: string;
  useCases: string[];
  docLink?: string;
}

const TOOLS: Tool[] = [
  { 
    id: 'search', 
    name: 'Google Search', 
    icon: '🌐', 
    description: 'Real-time web grounding for news and current events.', 
    category: 'RAG & Intelligence', 
    status: 'online',
    useCases: ['Current Event Verification', 'Market Research', 'Fact Checking'],
    docLink: 'https://ai.google.dev/gemini-api/docs/google-search-grounding'
  },
  { 
    id: 'rag-vector', 
    name: 'Vector DB', 
    icon: '🗂️', 
    description: 'High-performance retrieval across internal document embeddings.', 
    category: 'RAG & Intelligence', 
    status: 'online',
    useCases: ['Document Semantic Search', 'Knowledge Base QA', 'Personal Data RAG'],
    docLink: 'https://docs.flynt.studio/tools/vector-db'
  },
  { 
    id: 'knowledge-graph', 
    name: 'Knowledge Graph', 
    icon: '🕸️', 
    description: 'Semantic mapping of entity relationships.', 
    category: 'RAG & Intelligence', 
    status: 'online',
    useCases: ['Entity Relationship Discovery', 'Complex Reasoning Paths', 'Structured Metadata Extraction'],
    docLink: 'https://docs.flynt.studio/tools/knowledge-graph'
  },
  { 
    id: 'mcp-bridge', 
    name: 'MCP Bridge', 
    icon: '🌉', 
    description: 'Model Context Protocol connector for external ecosystem data.', 
    category: 'MCP', 
    status: 'online',
    useCases: ['SaaS Data Integration', 'Custom Context Loading', 'External API Bridging'],
    docLink: 'https://docs.flynt.studio/tools/mcp'
  },
  { 
    id: 'spark', 
    name: 'Spark Engine', 
    icon: '⚡', 
    description: 'Distributed data processing for massive datasets.', 
    category: 'Data Science', 
    status: 'online',
    useCases: ['Big Data Transformation', 'ETL Pipelines', 'Large Scale Aggregation'],
    docLink: 'https://spark.apache.org/docs/latest/'
  },
  { 
    id: 'pandas', 
    name: 'Pandas Node', 
    icon: '🐼', 
    description: 'Local Python-based data manipulation and cleaning.', 
    category: 'Data Science', 
    status: 'online',
    useCases: ['Data Cleaning', 'Exploratory Data Analysis', 'DataFrame Operations'],
    docLink: 'https://pandas.pydata.org/docs/'
  },
  { 
    id: 'ml-inference', 
    name: 'Inference Node', 
    icon: '🧠', 
    description: 'Real-time prediction and model serving.', 
    category: 'ML', 
    status: 'online',
    useCases: ['Model Prediction', 'Batch Scoring', 'Anomaly Detection'],
    docLink: 'https://docs.flynt.studio/tools/ml'
  },
  { 
    id: 'k8s', 
    name: 'K8s Controller', 
    icon: '☸️', 
    description: 'Automated container orchestration and scaling.', 
    category: 'DevOps', 
    status: 'online',
    useCases: ['Container Scaling', 'Deployment Management', 'Resource Optimization'],
    docLink: 'https://kubernetes.io/docs/home/'
  },
  { 
    id: 'ci-cd', 
    name: 'CI/CD Bridge', 
    icon: '🚀', 
    description: 'Automated testing and deployment pipelines.', 
    category: 'DevOps', 
    status: 'online',
    useCases: ['Automated Tests', 'Deployment Webhooks', 'Build Triggers'],
    docLink: 'https://docs.flynt.studio/tools/devops'
  },
  { 
    id: 'model-reg', 
    name: 'Model Registry', 
    icon: '📜', 
    description: 'Version control and tracking for ML models.', 
    category: 'MLOps', 
    status: 'online',
    useCases: ['Model Versioning', 'Audit Trails', 'Deployment State Tracking'],
    docLink: 'https://docs.flynt.studio/tools/mlops'
  },
  { 
    id: 'feature-store', 
    name: 'Feature Store', 
    icon: '🏪', 
    description: 'Shared repository for model features.', 
    category: 'MLOps', 
    status: 'maintenance', 
    maintenanceSchedule: 'Nov 12, 01:00 UTC',
    useCases: ['Feature Reuse', 'Training-Serving Symmetry', 'Feature Monitoring'],
    docLink: 'https://docs.flynt.studio/tools/feature-store'
  },
  { 
    id: 'interpreter', 
    name: 'Code Interpreter', 
    icon: '💻', 
    description: 'Sandboxed Python execution.', 
    category: 'Core', 
    status: 'online',
    useCases: ['Dynamic Computation', 'Chart Generation', 'Algorithmic Problem Solving'],
    docLink: 'https://docs.flynt.studio/tools/interpreter'
  },
  { 
    id: 'functions', 
    name: 'Function Calling', 
    icon: '🛠️', 
    description: 'Dynamic interface for external API orchestration.', 
    category: 'Core', 
    status: 'online',
    useCases: ['Third-party API Integration', 'Tool Use Orchestration', 'Structured Output Generation'],
    docLink: 'https://docs.flynt.studio/tools/functions'
  },
  { 
    id: 'dep-manager', 
    name: 'Dependency Manager', 
    icon: '📦', 
    description: 'Resolves execution requirements.', 
    category: 'Core', 
    status: 'online',
    useCases: ['Environment Resolution', 'Library Management', 'Conflict Detection'],
    docLink: 'https://docs.flynt.studio/tools/dependencies'
  },
  { 
    id: 'debugger', 
    name: 'Step Debugger', 
    icon: '🐛', 
    description: 'Trace execution flow.', 
    category: 'Core', 
    status: 'offline',
    useCases: ['Breakpoint Analysis', 'Variable Inspection', 'Execution Stepping'],
    docLink: 'https://docs.flynt.studio/tools/debugger'
  }
];

interface ModelsAndToolsProps {
  enabledTools: string[];
  onToggleTool: (toolName: string) => void;
  onReportIssue: (name: string, message: string, type: ExecutionLog['type']) => void;
}

const ModelsAndTools: React.FC<ModelsAndToolsProps> = ({ enabledTools, onToggleTool, onReportIssue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeMaintenanceInfo, setActiveMaintenanceInfo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'Intelligence' | 'Data Science' | 'Ops' | 'Core'>('all');
  
  const [tooltipData, setTooltipData] = useState<{ text: string; x: number; y: number } | null>(null);

  const filteredModels = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'Core') return [];
    const term = searchTerm.toLowerCase();
    return MODELS.filter(m => 
      m.name.toLowerCase().includes(term) || 
      m.description.toLowerCase().includes(term) ||
      m.type.toLowerCase().includes(term)
    );
  }, [searchTerm, activeTab]);

  const filteredTools = useMemo<Tool[]>(() => {
    const term = searchTerm.toLowerCase();
    return TOOLS.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(term) || 
                           t.description.toLowerCase().includes(term) ||
                           t.category.toLowerCase().includes(term);
      
      if (activeTab === 'all') return matchesSearch;
      if (activeTab === 'Intelligence') return matchesSearch && (t.category === 'RAG & Intelligence' || t.category === 'MCP');
      if (activeTab === 'Ops') return matchesSearch && (t.category === 'DevOps' || t.category === 'MLOps');
      return matchesSearch && t.category === activeTab;
    });
  }, [searchTerm, activeTab]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const toolsByCategory = useMemo<Record<string, Tool[]>>(() => {
    const categories: Record<string, Tool[]> = {};
    filteredTools.forEach(tool => {
      if (!categories[tool.category]) categories[tool.category] = [];
      categories[tool.category].push(tool);
    });
    return categories;
  }, [filteredTools]);

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-[#050505] animate-in fade-in duration-700 relative custom-scrollbar">
      
      {tooltipData && (
        <div 
          className="fixed pointer-events-none z-[200] px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200 ease-out"
          style={{ 
            left: tooltipData.x + 15, 
            top: tooltipData.y + 15,
            maxWidth: '280px' 
          }}
        >
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Resource Specs</span>
             <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
               {tooltipData.text}
             </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Unified Search and Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-purple-600 rounded-full shadow-[0_0_15px_#a855f7]"></div>
                <h1 className="text-4xl font-light text-white tracking-tight">Registry <span className="text-zinc-500 font-medium">Explorer</span></h1>
             </div>
            <p className="text-zinc-500 max-w-xl text-sm leading-relaxed tracking-wide">
              Filter and initialize your Flynt Studio agentic toolbelt. Search by name, purpose, or category.
            </p>
          </div>
          
          <div className="flex flex-col gap-5 items-end">
            <div className="relative group w-96">
              <div className="absolute inset-0 bg-purple-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input
                type="text"
                placeholder="Search models or tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all material-surface"
              />
              <svg className="w-5 h-5 absolute left-4 top-4 text-zinc-600 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-md">
               {(['all', 'Intelligence', 'Data Science', 'Ops', 'Core'] as const).map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${
                     activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                   }`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {filteredModels.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Proprietary Compute</h2>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredModels.map((model) => (
                <div 
                  key={model.id} 
                  className="group material-card p-6 rounded-2xl material-surface border border-white/5 flex flex-col justify-between h-[280px] relative cursor-help"
                  onMouseEnter={(e) => setTooltipData({ text: model.description, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setTooltipData({ text: model.description, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltipData(null)}
                >
                  <div>
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-4 block">{model.type}</span>
                    <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">{model.name}</h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{model.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[9px] text-zinc-400 mono">{model.specs.context || model.specs.latency}</span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase">{model.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-12 pb-20">
          {/* Fix for line 368: adding explicit type assertion to handle loose typing of Object.entries in some environments */}
          {(Object.entries(toolsByCategory) as [string, Tool[]][]).map(([category, tools]) => (
            <div key={category} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-xl border border-white/5">{category}</h3>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools.map((tool) => {
                  const isActive = enabledTools.includes(tool.name);
                  const isStarred = favorites.includes(tool.id);
                  const isMaintenance = tool.status === 'maintenance';
                  const isOffline = tool.status === 'offline';
                  
                  return (
                    <div 
                      key={tool.id} 
                      className={`group/tool material-card p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col h-[220px] material-surface cursor-pointer ${
                        isActive ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'border-white/5 hover:border-white/20'
                      }`}
                      onClick={() => tool.status === 'online' && onToggleTool(tool.name)}
                      onMouseEnter={(e) => setTooltipData({ text: tool.description, x: e.clientX, y: e.clientY })}
                      onMouseMove={(e) => setTooltipData({ text: tool.description, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltipData(null)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{tool.icon}</div>
                        <div className="flex items-center gap-2">
                           <div 
                             className={`w-2 h-2 rounded-full ${tool.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : isMaintenance ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}
                             onClick={(e) => { e.stopPropagation(); if (isMaintenance) setActiveMaintenanceInfo(tool.id); }}
                           ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 truncate">
                          <h4 className={`text-sm font-bold tracking-tight truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>{tool.name}</h4>
                          <button onClick={(e) => toggleFavorite(tool.id, e)} className={`transition-transform hover:scale-125 ${isStarred ? 'text-amber-400' : 'text-zinc-800'}`}>★</button>
                        </div>
                        {tool.status === 'online' && (
                          <div className={`w-9 h-5 rounded-full p-1 transition-colors duration-300 ${isActive ? 'bg-purple-600' : 'bg-white/10'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-md ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium line-clamp-2">{tool.description}</p>

                      {tool.status === 'online' && (
                        <div className="absolute inset-0 bg-zinc-950/95 p-6 flex flex-col justify-center opacity-0 group-hover/tool:opacity-100 transition-all duration-300 pointer-events-none z-10">
                           <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Core Use Cases</h5>
                           <ul className="space-y-2">
                              {tool.useCases.slice(0, 3).map((useCase, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-[10px] text-zinc-300 font-medium truncate">
                                   <div className="w-1 h-1 bg-purple-500 rounded-full"></div>{useCase}
                                </li>
                              ))}
                           </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredTools.length === 0 && filteredModels.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="text-4xl">🔎</div>
              <p className="text-zinc-500 text-sm font-medium">No tool matching "{searchTerm}" found in Registry.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ModelsAndTools;
