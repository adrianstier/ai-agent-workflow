import { Express, Request, Response } from 'express';
import { createGitHubClient } from '../integrations/github';

export function setupGitHubRoutes(app: Express) {
  // Get repository structure
  app.get('/api/github/tree', async (req: Request, res: Response) => {
    try {
      const { path = '', ref = 'main' } = req.query;
      const github = createGitHubClient('default');
      const tree = await github.getRepoTree(path as string, ref as string);
      res.json(tree);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Get file content
  app.get('/api/github/file', async (req: Request, res: Response) => {
    try {
      const { path, ref = 'main' } = req.query;
      if (!path) {
        return res.status(400).json({ error: { message: 'Path is required' } });
      }
      const github = createGitHubClient('default');
      const file = await github.getFile(path as string, ref as string);
      res.json(file);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Update file
  app.put('/api/github/file', async (req: Request, res: Response) => {
    try {
      const { path, content, message, sha, branch = 'main' } = req.body;
      if (!path || !content || !message || !sha) {
        return res.status(400).json({ error: { message: 'Missing required fields' } });
      }
      const github = createGitHubClient('default');
      const result = await github.updateFile(path, content, message, sha, branch);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Create file
  app.post('/api/github/file', async (req: Request, res: Response) => {
    try {
      const { path, content, message, branch = 'main' } = req.body;
      if (!path || !content || !message) {
        return res.status(400).json({ error: { message: 'Missing required fields' } });
      }
      const github = createGitHubClient('default');
      const result = await github.createFile(path, content, message, branch);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Create branch
  app.post('/api/github/branch', async (req: Request, res: Response) => {
    try {
      const { branchName, fromBranch = 'main' } = req.body;
      if (!branchName) {
        return res.status(400).json({ error: { message: 'Branch name is required' } });
      }
      const github = createGitHubClient('default');
      const result = await github.createBranch(branchName, fromBranch);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // List branches
  app.get('/api/github/branches', async (req: Request, res: Response) => {
    try {
      const github = createGitHubClient('default');
      const branches = await github.getBranches();
      res.json(branches);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Create pull request
  app.post('/api/github/pull-request', async (req: Request, res: Response) => {
    try {
      const { title, head, base = 'main', body } = req.body;
      if (!title || !head) {
        return res.status(400).json({ error: { message: 'Title and head branch are required' } });
      }
      const github = createGitHubClient('default');
      const pr = await github.createPullRequest(title, head, base, body);
      res.json(pr);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Get pull requests
  app.get('/api/github/pull-requests', async (req: Request, res: Response) => {
    try {
      const { state = 'open' } = req.query;
      const github = createGitHubClient('default');
      const prs = await github.getPullRequests(state as 'open' | 'closed' | 'all');
      res.json(prs);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Get recent commits
  app.get('/api/github/commits', async (req: Request, res: Response) => {
    try {
      const { limit = 10 } = req.query;
      const github = createGitHubClient('default');
      const commits = await github.getRecentCommits(Number(limit));
      res.json(commits);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Get repository info
  app.get('/api/github/repo', async (req: Request, res: Response) => {
    try {
      const github = createGitHubClient('default');
      const repo = await github.getRepoInfo();
      res.json(repo);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Create issue
  app.post('/api/github/issue', async (req: Request, res: Response) => {
    try {
      const { title, body, labels } = req.body;
      if (!title) {
        return res.status(400).json({ error: { message: 'Title is required' } });
      }
      const github = createGitHubClient('default');
      const issue = await github.createIssue(title, body, labels);
      res.json(issue);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });

  // Search code
  app.get('/api/github/search', async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: { message: 'Search query is required' } });
      }
      const github = createGitHubClient('default');
      const results = await github.searchCode(q as string);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } });
    }
  });
}
