# GitHub Integration Setup Guide

## 🎯 What This Enables

With GitHub integration, your AI Agent Dashboard can:
- Browse your repository files directly in the UI
- Let agents read and edit code
- Create branches and pull requests
- View commits and file history
- Search code across your repo
- Create issues programmatically

## 📋 Setup Steps

### 1. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "AI Agent Dashboard"
4. Set expiration (recommend: 90 days or No expiration for development)
5. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `read:org` (Read org and team membership)
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

### 2. Configure Backend Environment

Add to `dashboard/backend/.env`:

```env
# Existing variables
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-api03-..."
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3002"

# GitHub Integration
GITHUB_TOKEN="ghp_your_token_here"
GITHUB_OWNER="yourusername"          # Your GitHub username or org
GITHUB_REPO="yourrepo"                # Repository name
```

### 3. Restart Backend

```bash
cd dashboard/backend
npm run dev
```

The backend will now have access to GitHub APIs.

## 🚀 Usage

### Access Code Browser

Navigate to: `http://localhost:3002/projects/{project-id}/code`

Features:
- Browse repository files and folders
- Switch between branches
- View file contents
- Edit files directly
- Save changes with commit messages
- Auto-push to GitHub

### Use GitHub Data in Agent Prompts

The agents can now access your codebase context:

```markdown
When Agent 6 (Engineer) receives a request:

1. Agent reads current file structure
2. Searches for relevant code
3. Understands existing patterns
4. Generates code following your style
5. Creates a new branch
6. Commits changes
7. Opens pull request
```

## 🔧 API Endpoints Available

### File Operations
- `GET /api/github/tree?path={path}&ref={branch}` - List files
- `GET /api/github/file?path={path}&ref={branch}` - Get file content
- `PUT /api/github/file` - Update file
- `POST /api/github/file` - Create file

### Branch & PR Operations
- `GET /api/github/branches` - List branches
- `POST /api/github/branch` - Create branch
- `POST /api/github/pull-request` - Create PR
- `GET /api/github/pull-requests` - List PRs

### Repository Info
- `GET /api/github/repo` - Get repo info
- `GET /api/github/commits` - Recent commits
- `GET /api/github/search?q={query}` - Search code

### Issues
- `POST /api/github/issue` - Create issue

## 💡 Advanced Workflows

### Workflow 1: Agent Makes Code Changes

1. User: "Add a new API endpoint for user profiles"
2. Agent 6 (Engineer):
   - Searches codebase for existing API patterns
   - Creates new branch: `feature/user-profile-endpoint`
   - Generates code following existing conventions
   - Commits to branch
   - Opens PR for review

### Workflow 2: Agent Reviews Code

1. User: "Review the latest PR"
2. Agent 7 (QA Engineer):
   - Fetches PR diff
   - Analyzes changes
   - Checks for bugs, security issues
   - Posts review comments
   - Suggests improvements

### Workflow 3: Agent Plans Features

1. User: "Plan the authentication system"
2. Agent 3 (Product Manager):
   - Reviews existing code structure
   - Creates GitHub issues for each task
   - Labels them appropriately
   - Assigns to milestones

## 🔒 Security Best Practices

1. **Never commit `.env` file**
   ```bash
   # Add to .gitignore
   dashboard/backend/.env
   ```

2. **Use token with minimum required permissions**
   - Only `repo` scope if working with private repos
   - Or `public_repo` if only public repos

3. **Rotate tokens regularly**
   - Set expiration dates
   - Update when needed

4. **Use separate tokens per environment**
   - Development token
   - Production token (if deployed)

## 🎨 Customizing Agent Prompts for GitHub

Update your agent prompts to use GitHub context:

**Example: `agents/agent-6-engineer.md`**

```markdown
## System Prompt

You are Agent 6: Engineer for the project.

**GitHub Access:**
You have full access to the repository via the GitHub API.

**Before writing code:**
1. Search for similar patterns in the codebase
2. Check the tech stack and dependencies
3. Follow existing code style and conventions
4. Review recent commits for context

**When implementing features:**
1. Create a feature branch: `feature/{feature-name}`
2. Write clean, documented code
3. Follow the project's coding standards
4. Commit with descriptive messages
5. Open a PR with detailed description

**Code Style:**
- Use the same formatting as existing files
- Add appropriate comments
- Include error handling
- Write tests if test files exist

**Workflow:**
{{GitHub workflow instructions}}
```

## 🔗 Connecting to Existing Project

To use this with your real GitHub project:

1. **Fork or clone** your existing project
2. **Add GitHub credentials** to `.env`
3. **Update agent prompts** with project-specific context
4. **Test** by browsing code in the dashboard
5. **Let agents work!**

## 📊 Monitoring Agent Actions

All GitHub API calls are logged in the backend console:

```
POST /api/github/file
GET /api/github/tree?path=src&ref=main
POST /api/github/branch
```

## 🐛 Troubleshooting

### "GitHub credentials not configured"
- Check `.env` has `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
- Restart backend after adding variables

### "404 Not Found"
- Verify repository name is correct
- Check token has access to the repository
- Ensure repository exists and is accessible

### "403 Forbidden"
- Token might be expired
- Token doesn't have required permissions
- Check repository is not archived

### "Rate limit exceeded"
- GitHub API has rate limits (5000/hour for authenticated)
- Wait or use caching
- Consider GitHub Apps for higher limits

## 🎯 Next Steps

1. **Test the integration**:
   ```bash
   curl http://localhost:4000/api/github/repo
   ```

2. **Browse your code**:
   Visit `http://localhost:3002/projects/{id}/code`

3. **Try agent code review**:
   Ask Agent 7 to review a recent commit

4. **Automate workflows**:
   Set up agents to create PRs automatically

---

**Ready to integrate with GitHub!** 🚀

Update your `.env` file and start building with AI agents that understand your codebase.
