
import { GoogleGenAI, Type } from "@google/genai";

export class MetaAgentService {
  /**
   * Orchestrates the task breakdown using Gemini's thinking capabilities.
   * Aligned with Flynt Studio spec: Ideate -> Plan -> Execute.
   */
  async planTask(userInput: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as the Flynt Studio PlannerAgent. 
        Analyze the user project request: "${userInput}".
        Break this project into a structured sequence of tasks using specialized agents.
        Available Agents: IdeaAgent, CoderAgent, NotebookAgent, DataScienceAgent, DataAnalysisAgent, VisualizerAgent, MediaAgent, FinetuningAgent.
        
        Define dependencies carefully: a subtask's dependency must be the 'id' of another subtask.
        Assign P1-P10 priority (P10 highest).`,
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              objective: { type: Type.STRING },
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Task slug, e.g., "init_codebase"' },
                    agentType: { type: Type.STRING, description: 'One of: IdeaAgent, CoderAgent, NotebookAgent, DataScienceAgent, DataAnalysisAgent, VisualizerAgent, MediaAgent, FinetuningAgent' },
                    description: { type: Type.STRING },
                    priority: { type: Type.NUMBER },
                    dependencies: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['id', 'agentType', 'description', 'priority', 'dependencies']
                }
              }
            },
            required: ['objective', 'subtasks']
          }
        }
      });

      const resultText = response.text;
      return resultText ? JSON.parse(resultText) : null;
    } catch (e) {
      console.error("Flynt Planning Failure", e);
      return null;
    }
  }

  /**
   * Simulates an agent execution with tool awareness
   */
  async executeAgentTask(agentType: string, taskDescription: string, context: string, enabledTools: string[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const tools: any[] = [];
    if (enabledTools.includes('Google Search')) {
      tools.push({ googleSearch: {} });
    }

    const systemInstruction = `You are the ${agentType} within the Flynt Studio framework. 
    Mission Objective: ${taskDescription}.
    Active ecosystem tools: ${enabledTools.join(', ')}.
    Context from previous nodes: ${context}.
    Produce a professional, technical output. Use Markdown for documentation and code blocks.`;

    try {
      const response = await ai.models.generateContent({
        model: enabledTools.includes('Google Search') ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: taskDescription,
        config: {
          systemInstruction,
          tools: tools.length > 0 ? tools : undefined,
        }
      });

      let output = response.text || '';
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (grounding && grounding.length > 0) {
        output += "\n\n### References\n";
        grounding.forEach((chunk: any) => {
          if (chunk.web) output += `- [${chunk.web.title}](${chunk.web.uri})\n`;
        });
      }

      return output;
    } catch (e) {
      return "Critical failure in agent deployment loop.";
    }
  }

  async generateAgentIcon(agentType: string): Promise<string | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `SVG path 'd' for minimalist logo for '${agentType}'. Coordinate system -10 to 10. Raw string only.`,
      });
      return response.text?.trim().replace(/^"(.*)"$/, '$1') || null;
    } catch (e) {
      return null;
    }
  }
}

export const metaAgentService = new MetaAgentService();
