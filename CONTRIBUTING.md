# Contributing to AI Agent Workflow

Thank you for your interest in contributing! This project aims to help solo builders create products using AI agents.

## How to Contribute

### Areas Where We Need Help

1. **Testing & Validation**
   - Test agents with different project types (e-commerce, fintech, healthcare, etc.)
   - Report edge cases or failures
   - Suggest prompt improvements

2. **Documentation**
   - Fix typos or unclear instructions
   - Add examples of real projects built with this system
   - Translate documentation to other languages
   - Create video tutorials

3. **Agent Enhancements**
   - Optimize existing agent prompts
   - Create specialized agents for specific domains
   - Improve error handling and edge cases

4. **Dashboard Development**
   - Implement features from the roadmap
   - Fix bugs
   - Improve UI/UX
   - Add tests

5. **Integration Examples**
   - LangGraph implementation examples
   - CrewAI integration examples
   - Other agent frameworks

## Contribution Process

### 1. For Documentation/Agents

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-agent-workflow.git
cd ai-agent-workflow

# Create a branch
git checkout -b feature/your-feature-name

# Make your changes
# Test with real projects!

# Commit with clear message
git commit -m "docs: improve Agent 3 prompt clarity

- Added more specific examples
- Clarified acceptance criteria requirements
- Tested with 3 different project types"

# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### 2. For Dashboard Code

```bash
# Same as above, plus:

# Set up development environment
cd dashboard
npm run setup

# Start dev servers
npm run dev

# Make changes and test locally
# Add tests if applicable

# Run lints and tests
npm run lint
npm test
```

## Commit Message Guidelines

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code refactoring
- `style:` Formatting changes
- `chore:` Build process or tool changes

Examples:
```
feat: add Agent 10 for DevSecOps
fix: Agent 5 over-engineering issue
docs: add example for mobile app project
test: add integration tests for Agent 3
```

## Testing Your Changes

### For Agent Prompts

Test your changes with at least 2-3 different project scenarios:

1. **Simple/Clear**: Well-defined requirements
2. **Vague/Ambiguous**: Unclear requirements (most common!)
3. **Complex**: Multi-faceted project

Document your testing in the PR:
```markdown
## Testing

Tested Agent 3 with:
1. E-commerce store (simple) - ✅ Output was scoped and actionable
2. AI-powered analytics tool (vague) - ✅ Asked good clarifying questions
3. Multi-tenant SaaS (complex) - ⚠️ Needed one revision to simplify scope

Overall: Improvement confirmed
```

### For Dashboard Code

```bash
# Run tests
cd dashboard/backend
npm test

cd ../frontend
npm test

# Manual testing
# 1. Create test project
# 2. Run agent execution
# 3. Verify artifact generation
# 4. Check database state
```

## Code Style

### Markdown (Documentation)
- Use clear, concise language
- Include examples
- Break up long paragraphs
- Use headers to organize content
- Code blocks should be properly tagged (```bash, ```typescript, etc.)

### TypeScript (Dashboard)
- Follow existing code style
- Use TypeScript strictly (no `any`)
- Add JSDoc comments for complex functions
- Write tests for new features

### Prompts (Agents)
- Keep prompts focused and clear
- Use examples liberally
- Include self-review checklists
- Test with multiple scenarios before submitting

## What Makes a Good Contribution?

✅ **Good**:
- Fixes a real problem you encountered
- Includes clear examples
- Well-tested with multiple scenarios
- Follows existing patterns
- Includes documentation updates

❌ **Needs Work**:
- Untested changes
- No description of what/why
- Breaks existing functionality
- Adds complexity without clear benefit

## Feature Requests

Before submitting a feature request:

1. Check if it already exists in Issues
2. Consider if it fits the project's goal (solo builders, 10-1000 users)
3. Think about implementation complexity
4. Provide clear use case and benefit

Use this template:
```markdown
## Feature Request: [Name]

**Problem**: [What problem does this solve?]

**Proposed Solution**: [How should it work?]

**Use Case**: [Concrete example]

**Alternatives Considered**: [What else did you think about?]

**Implementation Complexity**: [Low/Medium/High]
```

## Bug Reports

Use this template:
```markdown
## Bug Report: [Title]

**Description**: [What happened?]

**Expected Behavior**: [What should happen?]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Environment**:
- Agent: [Which agent?]
- LLM: [Claude/GPT-4/etc.]
- Project type: [What were you building?]

**Screenshots/Logs**: [If applicable]
```

## Getting Help

- **Questions**: Open a Discussion (not an Issue)
- **Bugs**: Open an Issue
- **Security**: Email [your-email] (don't open public issue)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn
- No spam or self-promotion
- Follow GitHub's community guidelines

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AI Agent Workflow!** 🎉

Every contribution, no matter how small, helps solo builders create better products with AI.
