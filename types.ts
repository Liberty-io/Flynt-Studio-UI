
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
  WAITING = 'waiting' // Human-in-the-loop
}

export enum AgentType {
  IDEA = 'IdeaAgent',
  PLANNER = 'PlannerAgent',
  CODER = 'CoderAgent',
  NOTEBOOK = 'NotebookAgent',
  DS = 'DataScienceAgent',
  ANALYSIS = 'DataAnalysisAgent',
  VISUALIZER = 'VisualizerAgent',
  MEDIA = 'MediaAgent',
  FINETUNING = 'FinetuningAgent'
}

export enum Tab {
  WORKSPACE = 'workspace',
  MODELS = 'models',
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

export interface AgentNode {
  id: string;
  type: AgentType;
  label: string;
  status: AgentStatus;
  output?: string;
  shadowOutput?: string; // For benchmarking
  children?: AgentNode[];
  timestamp: number;
  priority: number;
  dependencies: string[];
  tokens?: number;
  cost?: number;
}

export interface ExecutionLog {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'thought';
  timestamp: number;
}

export interface MetaState {
  isProcessing: boolean;
  isPaused: boolean;
  nodes: AgentNode[];
  logs: ExecutionLog[];
  userInput: string;
  activeNodeId: string | null;
  currentTab: Tab;
  dynamicIcons: Record<string, string>;
  enabledTools: string[];
  providerMode: 'cloud' | 'local';
  shadowMode: boolean; // Benchmark mode
  totalTokens: number;
  totalCost: number;
}
