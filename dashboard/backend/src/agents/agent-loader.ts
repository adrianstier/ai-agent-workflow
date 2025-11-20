import fs from 'fs';
import path from 'path';

export interface AgentConfig {
  id: number;
  name: string;
  role: string;
  systemPrompt: string;
  filePath: string;
}

// Load agent prompts from markdown files
export function loadAgentPrompt(agentId: number): AgentConfig | null {
  try {
    // Agent files are in the parent agents directory
    // Use absolute path for reliability
    const agentsDir = '/Users/adrianstiermbp2023/Desktop/sass-agent-workflow/agents';
    const agentFiles = [
      'agent-0-orchestrator.md',
      'agent-1-problem-framer.md',
      'agent-2-competitive-mapper.md',
      'agent-3-product-manager.md',
      'agent-4-ux-designer.md',
      'agent-5-system-architect.md',
      'agent-6-engineer.md',
      'agent-7-qa-test-engineer.md',
      'agent-8-devops-deployment.md',
      'agent-9-analytics-growth.md',
    ];

    if (agentId < 0 || agentId >= agentFiles.length) {
      return null;
    }

    const filePath = path.join(agentsDir, agentFiles[agentId]);

    if (!fs.existsSync(filePath)) {
      console.error(`Agent file not found: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract system prompt from markdown (content between ``` blocks under ## System Prompt)
    const systemPromptMatch = content.match(/## System Prompt\s*```([^`]+)```/s);
    const systemPrompt = systemPromptMatch ? systemPromptMatch[1].trim() : content;

    // Extract agent name from first # heading
    const nameMatch = content.match(/^#\s+(.+)$/m);
    const name = nameMatch ? nameMatch[1] : `Agent ${agentId}`;

    // Extract role from ## Role section
    const roleMatch = content.match(/## Role\s+(.+?)(?=\n##|\n\n)/s);
    const role = roleMatch ? roleMatch[1].trim() : 'AI Agent';

    return {
      id: agentId,
      name,
      role,
      systemPrompt,
      filePath,
    };
  } catch (error) {
    console.error(`Error loading agent ${agentId}:`, error);
    return null;
  }
}

// Load all agents
export function loadAllAgents(): AgentConfig[] {
  const agents: AgentConfig[] = [];

  for (let i = 0; i < 10; i++) {
    const agent = loadAgentPrompt(i);
    if (agent) {
      agents.push(agent);
    }
  }

  return agents;
}

// Get agent metadata (without full prompt)
export function getAgentMetadata(agentId: number) {
  const agent = loadAgentPrompt(agentId);

  if (!agent) {
    return null;
  }

  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
  };
}

// Get all agent metadata
export function getAllAgentMetadata() {
  return loadAllAgents().map((agent) => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
  }));
}
