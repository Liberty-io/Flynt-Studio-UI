
export const COLORS = {
  IDEA: '#f472b6',      // Pink
  PLANNER: '#a855f7',   // Purple
  CODER: '#10b981',     // Emerald
  NOTEBOOK: '#6366f1',  // Indigo
  DS: '#0ea5e9',        // Blue
  ANALYSIS: '#f59e0b',  // Amber
  VISUALIZER: '#fbbf24',// Yellow
  MEDIA: '#ec4899',     // Rose
  FINETUNING: '#ef4444',// Red
};

export const INITIAL_NODES = [
  {
    id: 'flynt-root',
    type: 'PlannerAgent',
    label: 'Flynt Orchestrator',
    status: 'idle',
    timestamp: Date.now(),
    children: [],
    priority: 10,
    dependencies: []
  }
];
