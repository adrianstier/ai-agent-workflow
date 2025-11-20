import { Octokit } from '@octokit/rest';

export class GitHubIntegration {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string, owner: string, repo: string) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  // Get repository structure
  async getRepoTree(path: string = '', ref: string = 'main') {
    const { data } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
      ref,
    });
    return data;
  }

  // Get file content
  async getFile(path: string, ref: string = 'main') {
    const { data } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
      ref,
    });

    if ('content' in data) {
      return {
        content: Buffer.from(data.content, 'base64').toString('utf-8'),
        sha: data.sha,
        path: data.path,
        name: data.name,
      };
    }
    throw new Error('Not a file');
  }

  // Update file
  async updateFile(path: string, content: string, message: string, sha: string, branch: string = 'main') {
    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch,
    });
    return data;
  }

  // Create file
  async createFile(path: string, content: string, message: string, branch: string = 'main') {
    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
    });
    return data;
  }

  // Create branch
  async createBranch(branchName: string, fromBranch: string = 'main') {
    // Get reference of the base branch
    const { data: refData } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${fromBranch}`,
    });

    // Create new branch
    const { data } = await this.octokit.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha,
    });

    return data;
  }

  // Create Pull Request
  async createPullRequest(title: string, head: string, base: string = 'main', body?: string) {
    const { data } = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title,
      head,
      base,
      body,
    });
    return data;
  }

  // Get recent commits
  async getRecentCommits(limit: number = 10) {
    const { data } = await this.octokit.repos.listCommits({
      owner: this.owner,
      repo: this.repo,
      per_page: limit,
    });
    return data;
  }

  // Get repository info
  async getRepoInfo() {
    const { data } = await this.octokit.repos.get({
      owner: this.owner,
      repo: this.repo,
    });
    return data;
  }

  // List branches
  async getBranches() {
    const { data } = await this.octokit.repos.listBranches({
      owner: this.owner,
      repo: this.repo,
    });
    return data;
  }

  // Get pull requests
  async getPullRequests(state: 'open' | 'closed' | 'all' = 'open') {
    const { data } = await this.octokit.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state,
    });
    return data;
  }

  // Create issue
  async createIssue(title: string, body?: string, labels?: string[]) {
    const { data } = await this.octokit.issues.create({
      owner: this.owner,
      repo: this.repo,
      title,
      body,
      labels,
    });
    return data;
  }

  // Search code
  async searchCode(query: string) {
    const { data } = await this.octokit.search.code({
      q: `${query} repo:${this.owner}/${this.repo}`,
    });
    return data;
  }

  // Get file diff between commits
  async getCommitDiff(ref: string) {
    const { data } = await this.octokit.repos.getCommit({
      owner: this.owner,
      repo: this.repo,
      ref,
    });
    return data;
  }
}

// Factory function
export function createGitHubClient(projectId: string) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || '';
  const repo = process.env.GITHUB_REPO || '';

  if (!token || !owner || !repo) {
    throw new Error('GitHub credentials not configured');
  }

  return new GitHubIntegration(token, owner, repo);
}
