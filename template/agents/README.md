# AI Agent Prompt Library

This directory contains ready-to-use prompts for 10 specialized AI agents in the product development workflow.

## Quick Start

1. **Choose your agent** based on your current task
2. **Open the agent file** and copy the system prompt
3. **Paste into Claude/ChatGPT** (or your AI tool)
4. **Provide the required inputs** (specified in each file)
5. **Save the output** to the appropriate artifact file

## Agent Directory

| Agent | File | Use When | Output |
|-------|------|----------|--------|
| **Agent 0** | [agent-0-orchestrator.md](agent-0-orchestrator.md) | Starting project, feeling stuck, need direction | Status summary + next actions |
| **Agent 1** | [agent-1-problem-framer.md](agent-1-problem-framer.md) | Have vague idea, need to define problem | `artifacts/problem-brief-v0.1.md` |
| **Agent 2** | [agent-2-competitive-mapper.md](agent-2-competitive-mapper.md) | Need to understand competition | `artifacts/competitive-analysis-v0.1.md` |
| **Agent 3** | [agent-3-product-manager.md](agent-3-product-manager.md) | Need to scope features for v0.1 | `artifacts/prd-v0.1.md` |
| **Agent 4** | [agent-4-ux-designer.md](agent-4-ux-designer.md) | Need to design user flows | `artifacts/ux-flows-v0.1.md` |
| **Agent 5** | [agent-5-system-architect.md](agent-5-system-architect.md) | Need to choose tech stack | `artifacts/architecture-v0.1.md` |
| **Agent 6** | [agent-6-engineer.md](agent-6-engineer.md) | Ready to code features | Code in `src/` directory |
| **Agent 7** | [agent-7-qa-test-engineer.md](agent-7-qa-test-engineer.md) | Need to test features | `artifacts/test-plan-v0.1.md` + tests |
| **Agent 8** | [agent-8-devops-deployment.md](agent-8-devops-deployment.md) | Ready to deploy | `artifacts/deployment-plan-v0.1.md` + CI config |
| **Agent 9** | [agent-9-analytics-growth.md](agent-9-analytics-growth.md) | Need to measure and grow | `artifacts/analytics-plan-v0.1.md` |

## Typical Workflow

### Week 1: Discovery & Planning
```
1. Agent 0 (Orchestrator) → Get started
2. Agent 1 (Problem Framer) → Define the problem
3. Agent 2 (Competitive Mapper) → Map the landscape
4. Agent 3 (Product Manager) → Write PRD v0.1
5. Agent 4 (UX Designer) → Design flows
6. Agent 5 (System Architect) → Choose tech stack
```

### Week 2-3: Build
```
7. Agent 6 (Engineer) → Implement features (daily)
8. Agent 7 (QA & Test) → Write tests (as features complete)
```

### Week 4: Deploy & Launch
```
9. Agent 8 (DevOps) → Set up deployment
10. Agent 9 (Analytics) → Instrument tracking
11. Agent 0 (Orchestrator) → Plan v0.2
```

## How to Use Each Agent

### Manual (Copy-Paste)

1. Open the agent file
2. Copy the entire system prompt (inside the code block)
3. Start a new conversation in Claude/ChatGPT
4. Paste the system prompt as the first message
5. Provide your inputs
6. Save the output to the specified file

### Claude Projects (Recommended)

1. Create a new Project in Claude
2. Upload all relevant artifact files as "Project Knowledge"
3. Set the agent's system prompt as "Custom Instructions"
4. Have conversations with context automatically included
5. Switch agents by creating new chats with different system prompts

### Programmatic (LangGraph/CrewAI)

Use the system prompts as the `system` message or `backstory` in your agent framework:

```python
from langchain_anthropic import ChatAnthropic

# Read agent prompt from file
with open('agents/agent-1-problem-framer.md', 'r') as f:
    content = f.read()
    # Extract system prompt between ``` markers
    system_prompt = extract_prompt(content)

# Create agent
llm = ChatAnthropic(model="claude-sonnet-4-5")
messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": "I want to build..."}
]
response = llm.invoke(messages)
```

## Tips for Best Results

### 1. Provide Context
Don't just paste the system prompt. Also provide:
- Previous artifacts (Problem Brief, PRD, etc.)
- Specific constraints (timeline, budget, tech preferences)
- Any decisions you've already made

### 2. Iterate
Agents rarely produce perfect output on first try:
- Review the output critically
- Ask follow-up questions
- Request revisions with specific feedback

### 3. Lock Artifacts
Before moving to the next phase:
- Review and approve the current artifact
- Mark it as "locked" in your project state
- This prevents scope creep downstream

### 4. Challenge Recommendations
Agents are advisors, not dictators:
- If PRD seems too big, push back on scope
- If architecture seems too complex, ask for simpler options
- If tests seem excessive, ask for prioritization

### 5. Mix and Match
You don't have to use all 10 agents:
- For small projects, skip competitive analysis
- For internal tools, skip analytics/growth
- For research projects, focus on Problem Framer + Engineer

## Example: Starting a New Project

```bash
# 1. Copy Agent 0's prompt
cat agents/agent-0-orchestrator.md

# 2. Paste into Claude and provide context:
"I want to build a tool for PhD students to manage literature reviews.
Timeline: 4 weeks
Budget: $0/month
Tech: TypeScript, prefer managed services
What should I do first?"

# 3. Agent 0 will recommend starting with Agent 1 and provide a prompt

# 4. Copy that prompt, start new chat, paste Agent 1's system prompt

# 5. Continue through agents as recommended
```

## Customizing Agents

Feel free to modify these prompts for your needs:

**Make it stricter:**
- Add "Never suggest more than 5 features for v0.1"
- Add "Always include cost estimates"

**Make it domain-specific:**
- Replace generic examples with your domain (e.g., "research tools" instead of "products")
- Add domain expertise (e.g., "You have expertise in bioinformatics")

**Adjust tone:**
- "Be more casual and conversational"
- "Be extremely concise, bullet points only"
- "Include relevant emojis for visual scanning"

## Getting Help

If an agent produces unclear or unhelpful output:

1. **Re-read the "When to Invoke" section** - are you using the right agent?
2. **Check the "Example Usage"** - are you providing the right inputs?
3. **Try Agent 0 (Orchestrator)** - it can help diagnose what's going wrong
4. **Iterate with follow-ups** - "That's too complex, simplify it"

## Advanced: Agent Chaining

You can chain agents in a single conversation:

```
1. Start with Agent 1's prompt
2. Get Problem Brief
3. In same conversation, say "Now act as Agent 2 (Competitive Mapper)" and paste Agent 2's prompt
4. Agent now has context from Agent 1's output
5. Continue chaining
```

This works well in Claude Projects where context persists.

## Next Steps

1. **Set up your project structure:**
   ```bash
   mkdir -p artifacts state
   ```

2. **Start with Agent 0:**
   Open [agent-0-orchestrator.md](agent-0-orchestrator.md) and copy the prompt

3. **Follow the workflow:**
   Use the Typical Workflow guide above

4. **Refer to the implementation guide:**
   See [../agent_implementation_guide.md](../agent_implementation_guide.md) for deeper details

Good luck building!
