import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { executeAgent, getExecutionStatus } from '../agents/agent-executor';
import { getAllAgentMetadata } from '../agents/agent-loader';

const prisma = new PrismaClient();

export function setupRoutes(app: Express) {
  // Projects
  app.get('/api/projects', async (req, res, next) => {
    try {
      const projects = await prisma.project.findMany({
        orderBy: { updatedAt: 'desc' },
      });
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/projects', async (req, res, next) => {
    try {
      const { name, description, constraints } = req.body;

      // For now, create a default user if none exists
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'default@example.com',
            name: 'Default User',
          },
        });
      }

      const project = await prisma.project.create({
        data: {
          userId: user.id,
          name,
          description,
          constraints,
        },
      });

      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/projects/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          artifacts: true,
          executions: true,
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/projects/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, constraints, status, stage } = req.body;

      const project = await prisma.project.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(constraints && { constraints }),
          ...(status && { status }),
          ...(stage && { stage }),
        },
      });

      res.json(project);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/projects/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      await prisma.project.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Get all agents metadata
  app.get('/api/agents', async (req, res, next) => {
    try {
      const agents = getAllAgentMetadata();
      res.json(agents);
    } catch (error) {
      next(error);
    }
  });

  // Agent execution endpoint
  app.post('/api/projects/:id/agents/:agentId/execute', async (req, res, next) => {
    try {
      const { id, agentId } = req.params;
      const { userMessage, context } = req.body;

      if (!userMessage) {
        return res.status(400).json({ error: 'userMessage is required' });
      }

      // Execute agent
      const result = await executeAgent({
        projectId: id,
        agentId: parseInt(agentId),
        userMessage,
        context,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Get execution status
  app.get('/api/executions/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const execution = await getExecutionStatus(id);

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }

      res.json(execution);
    } catch (error) {
      next(error);
    }
  });

  // Artifacts
  app.get('/api/projects/:id/artifacts', async (req, res, next) => {
    try {
      const { id } = req.params;
      const artifacts = await prisma.artifact.findMany({
        where: { projectId: id },
        orderBy: { updatedAt: 'desc' },
      });
      res.json(artifacts);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/artifacts/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const artifact = await prisma.artifact.findUnique({
        where: { id },
      });

      if (!artifact) {
        return res.status(404).json({ error: 'Artifact not found' });
      }

      res.json(artifact);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/artifacts/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content, status } = req.body;

      const artifact = await prisma.artifact.update({
        where: { id },
        data: {
          ...(content && { content }),
          ...(status && { status }),
        },
      });

      res.json(artifact);
    } catch (error) {
      next(error);
    }
  });
}
