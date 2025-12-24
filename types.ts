
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed'
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
  children?: AgentNode[];
  timestamp: number;
  priority: number;
  dependencies: string[];
}

export interface ExecutionLog {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface MetaState {
  isProcessing: boolean;
  nodes: AgentNode[];
  logs: ExecutionLog[];
  userInput: string;
  activeNodeId: string | null;
  currentTab: Tab;
  dynamicIcons: Record<string, string>;
  enabledTools: string[];
  providerMode: 'cloud' | 'local';
}
