const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Project {
  id: string;
  name: string;
  description?: string;
  version: string;
  stage: string;
  status: string;
  constraints?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: number;
  name: string;
  role: string;
}

export interface Message {
  id: string;
  role: string;
  agentId?: number;
  content: string;
  createdAt: string;
}

export interface AgentExecution {
  id: string;
  agentId: number;
  status: string;
  input: string;
  output?: string;
  tokensUsed?: number;
  cost?: number;
  duration?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
  messages?: Message[];
}

export const api = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_URL}/api/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProject(id: string): Promise<Project & { messages: Message[]; executions: AgentExecution[] }> {
    const res = await fetch(`${API_URL}/api/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async createProject(data: { name: string; description?: string; constraints?: string }): Promise<Project> {
    const res = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  // Agents
  async getAgents(): Promise<Agent[]> {
    const res = await fetch(`${API_URL}/api/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async executeAgent(projectId: string, agentId: number, userMessage: string): Promise<{
    executionId: string;
    output: string;
    tokensUsed: number;
    cost: number;
  }> {
    const res = await fetch(`${API_URL}/api/projects/${projectId}/agents/${agentId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'Failed to execute agent');
    }
    return res.json();
  },

  // Executions
  async getExecution(id: string): Promise<AgentExecution> {
    const res = await fetch(`${API_URL}/api/executions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch execution');
    return res.json();
  },
};
