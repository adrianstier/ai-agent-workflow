import { Express } from 'express';
import { projectRoutes } from './projects';
import { artifactRoutes } from './artifacts';
import { executionRoutes } from './executions';
import { messageRoutes } from './messages';
import { decisionRoutes } from './decisions';
import { analyticsRoutes } from './analytics';

export function setupRoutes(app: Express) {
  // API prefix
  const apiPrefix = '/api';

  // Mount routes
  app.use(`${apiPrefix}/projects`, projectRoutes);
  app.use(`${apiPrefix}/artifacts`, artifactRoutes);
  app.use(`${apiPrefix}/executions`, executionRoutes);
  app.use(`${apiPrefix}/messages`, messageRoutes);
  app.use(`${apiPrefix}/decisions`, decisionRoutes);
  app.use(`${apiPrefix}/analytics`, analyticsRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}
