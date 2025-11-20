import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { loadAgentPrompt } from './agent-loader';

const prisma = new PrismaClient();

export interface ExecuteAgentInput {
  projectId: string;
  agentId: number;
  userMessage: string;
  context?: any;
}

export interface ExecuteAgentResult {
  executionId: string;
  output: string;
  tokensUsed: number;
  cost: number;
  artifacts?: any[];
}

// Initialize Anthropic client
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('ANTHROPIC_API_KEY not set in environment variables');
  }

  return new Anthropic({
    apiKey,
  });
}

// Execute an agent
export async function executeAgent(input: ExecuteAgentInput): Promise<ExecuteAgentResult> {
  const { projectId, agentId, userMessage, context } = input;

  // Load agent configuration
  const agentConfig = loadAgentPrompt(agentId);

  if (!agentConfig) {
    throw new Error(`Agent ${agentId} not found`);
  }

  // Create execution record
  const execution = await prisma.agentExecution.create({
    data: {
      projectId,
      agentId,
      status: 'RUNNING',
      input: JSON.stringify({ userMessage, context }),
    },
  });

  try {
    // Get project context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        artifacts: {
          where: { status: 'LOCKED' },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Build context message
    let contextMessage = `Project: ${project.name}\n`;

    if (project.description) {
      contextMessage += `Description: ${project.description}\n`;
    }

    if (project.constraints) {
      try {
        const constraints = JSON.parse(project.constraints);
        contextMessage += `\nConstraints:\n`;
        contextMessage += `- Timeline: ${constraints.timeline || 'Not specified'}\n`;
        contextMessage += `- Budget: ${constraints.budget || 'Not specified'}\n`;
        contextMessage += `- Tech Stack: ${constraints.techStack || 'Not specified'}\n`;
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // Add previous artifacts as context
    if (project.artifacts.length > 0) {
      contextMessage += `\n--- Previous Artifacts ---\n\n`;
      for (const artifact of project.artifacts) {
        contextMessage += `## ${artifact.type} (${artifact.version})\n\n`;
        contextMessage += `${artifact.content}\n\n`;
        contextMessage += `---\n\n`;
      }
    }

    // Call Claude API
    const client = getAnthropicClient();
    const startTime = Date.now();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: agentConfig.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${contextMessage}\n\nUser Request:\n${userMessage}`,
        },
      ],
    });

    const duration = Date.now() - startTime;

    // Extract output
    const output = response.content[0].type === 'text' ? response.content[0].text : '';

    // Calculate cost (approximate)
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = (inputTokens * 0.003 + outputTokens * 0.015) / 1000;

    // Save message
    await prisma.message.create({
      data: {
        projectId,
        executionId: execution.id,
        role: 'USER',
        agentId: null,
        content: userMessage,
      },
    });

    await prisma.message.create({
      data: {
        projectId,
        executionId: execution.id,
        role: 'AGENT',
        agentId,
        content: output,
      },
    });

    // Update execution record
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'COMPLETED',
        output: JSON.stringify({ text: output }),
        duration,
        tokensUsed: inputTokens + outputTokens,
        cost,
        completedAt: new Date(),
      },
    });

    return {
      executionId: execution.id,
      output,
      tokensUsed: inputTokens + outputTokens,
      cost,
    };
  } catch (error: any) {
    // Update execution with error
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'FAILED',
        error: error.message,
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

// Get agent execution status
export async function getExecutionStatus(executionId: string) {
  const execution = await prisma.agentExecution.findUnique({
    where: { id: executionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return execution;
}
