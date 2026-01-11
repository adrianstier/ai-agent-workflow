# Agent Testing Framework

A comprehensive framework for testing, validating, and continuously improving the AI agent workflow system.

## Overview

This framework provides:
1. **Scenario-based testing** - Realistic product development scenarios for each agent
2. **Automated evaluation** - Measurable quality metrics with weighted scoring
3. **Regression testing** - Track agent performance over time
4. **A/B comparison** - Compare agent versions before/after changes
5. **Continuous improvement** - Data-driven feedback loops for agent refinement
6. **Guardrail validation** - Ensure agents stay within defined boundaries

## Quick Start

```bash
# Test a specific agent
npx ts-node run-tests.ts --agent 1

# Test all agents with scenario files
npx ts-node run-tests.ts --all

# Save results to history for trend analysis
npx ts-node run-tests.ts --agent 1 --save

# Compare agent performance over time
npx ts-node run-tests.ts --compare 1

# Generate summary report
npx ts-node run-tests.ts --report

# Run specific scenario
npx ts-node run-tests.ts --agent 1 --scenario pf-001

# Verbose output for debugging
npx ts-node run-tests.ts --agent 1 --verbose
```

## Directory Structure

```
testing/
├── README.md                    # This file
├── run-tests.ts                 # CLI test runner
├── framework/
│   ├── test-harness.ts         # Core testing infrastructure
│   ├── scorecard.ts            # Agent scoring and metrics system
│   ├── evaluators/             # Evaluation functions
│   │   ├── output-quality.ts   # Output quality scoring
│   │   ├── consistency.ts      # Cross-agent consistency
│   │   └── completeness.ts     # Artifact completeness
│   └── reporters/              # Test result reporters
├── scenarios/                   # Test scenarios by agent
│   ├── agent-0-scenarios.json  # Orchestrator scenarios
│   ├── agent-1-scenarios.json  # Problem Framer scenarios
│   ├── agent-3-scenarios.json  # Architect scenarios
│   ├── agent-6-scenarios.json  # Engineer scenarios
│   └── agent-19-scenarios.json # Database Engineer scenarios
├── fixtures/
│   ├── inputs/                 # Sample inputs for each agent
│   ├── expected-outputs/       # Golden files for comparison
│   └── edge-cases/             # Edge case inputs
├── results/
│   ├── history.json            # Historical test results
│   └── run-*.json              # Individual test run results
└── reports/                    # Generated scorecard reports
```

## Scenario File Format

Each agent has a JSON scenario file with the following structure:

```json
{
  "agentId": 1,
  "agentName": "Problem Framer",
  "scenarios": [
    {
      "id": "pf-001",
      "name": "Clear Business Problem",
      "description": "Test handling of well-defined business problem",
      "input": {
        "problem": "...",
        "context": "..."
      },
      "expectedOutput": {
        "mustContain": ["problem statement", "stakeholders", "success criteria"],
        "structure": {
          "hasProblemStatement": true,
          "hasStakeholderAnalysis": true
        }
      },
      "evaluationCriteria": {
        "completeness": {
          "weight": 0.25,
          "checks": ["Required sections present", "All fields populated"]
        },
        "quality": {
          "weight": 0.35,
          "checks": ["Specific and measurable", "Actionable recommendations"]
        }
      }
    }
  ],
  "edgeCases": [
    {
      "id": "pf-edge-001",
      "name": "Vague Input",
      "description": "Handle ambiguous requirements",
      "input": { "problem": "make it better" },
      "expectedBehavior": "Should ask clarifying questions",
      "guardrailCheck": true
    }
  ],
  "guardrails": {
    "mustNotContain": ["guaranteed", "simple", "easy"],
    "mustWarn": ["missing requirements", "ambiguous scope"]
  }
}
```

## Testing Dimensions

### 1. Output Quality (30% weight)
- **Completeness**: All required sections present
- **Accuracy**: Information is factually correct
- **Specificity**: Concrete details vs vague generalities
- **Actionability**: User can act on the output

### 2. Process Adherence (20% weight)
- Follows defined phases in agent prompt
- Uses correct templates and formats
- Applies self-reflection checklist
- Completes all mandatory steps

### 3. Guardrail Compliance (20% weight)
- No forbidden content generated
- Appropriate warnings when needed
- Stays within defined scope
- Handles edge cases gracefully

### 4. Handoff Quality (15% weight)
- Correct artifact format for next agent
- Required fields populated
- Clear success criteria
- Context preserved from inputs

### 5. Consistency (15% weight)
- Similar inputs produce similar quality
- Low variance across scenarios
- Predictable behavior patterns

## Scoring System

The scorecard system provides detailed metrics:

### Overall Score Calculation
```
Overall = (Completeness × 0.20) +
          (Quality × 0.30) +
          (Consistency × 0.15) +
          (Guardrails × 0.20) +
          (Handoff × 0.15)
```

### Score Grades
| Score | Grade | Status |
|-------|-------|--------|
| 90-100 | A | Excellent |
| 80-89 | B | Good |
| 70-79 | C | Acceptable |
| 60-69 | D | Needs Improvement |
| 0-59 | F | Failing |

### Passing Threshold
- Minimum overall score: **70%**
- Guardrail compliance: **100%** (any violation = fail)

## Writing New Scenarios

### Step 1: Identify Test Cases
For each agent, identify:
- Happy path scenarios (ideal inputs)
- Edge cases (ambiguous, incomplete, contradictory inputs)
- Guardrail tests (boundary and violation scenarios)

### Step 2: Define Expected Outputs
Specify:
- `mustContain`: Key terms/sections that must appear
- `structure`: Structural requirements (has X section, etc.)
- Evaluation criteria with weights and specific checks

### Step 3: Create Scenario File
```bash
# Create new scenario file
touch scenarios/agent-X-scenarios.json
```

### Step 4: Run and Validate
```bash
# Test the new scenarios
npx ts-node run-tests.ts --agent X --verbose
```

## Interpreting Results

### Test Output
```
Testing Agent 1: Problem Framer
==================================================
  ✓ Clear Business Problem: 85%
  ✓ Technical Problem: 82%
  ✗ Vague Input Handling: 65%
  ✓ Multi-stakeholder Analysis: 78%

--------------------------------------------------
Overall Score: 77%
Pass Rate: 75% (3/4)
```

### Recommendations
The scorecard system generates automatic recommendations:
- Low completeness → Review required sections in prompt
- Guardrail violations → Add stronger constraints
- Low specificity → Request more examples in prompt
- Low actionability → Include step-by-step templates

## Continuous Improvement Workflow

1. **Run baseline tests** for all agents
   ```bash
   npx ts-node run-tests.ts --all --save
   ```

2. **Identify improvement areas** from scorecards
   ```bash
   npx ts-node run-tests.ts --report
   ```

3. **Make agent prompt changes** based on recommendations

4. **Re-run tests** to measure improvement
   ```bash
   npx ts-node run-tests.ts --agent X --save
   ```

5. **Compare versions** to validate improvement
   ```bash
   npx ts-node run-tests.ts --compare X
   ```

6. **Repeat** until target scores achieved

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Agent Quality Tests

on:
  push:
    paths:
      - 'agents/**'

jobs:
  test-agents:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run agent tests
        run: npx ts-node testing/run-tests.ts --all

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: testing/results/
```

## Adding LLM-as-Judge Evaluation

For production use, replace the mock evaluation with actual LLM calls:

```typescript
async function evaluateWithLLM(
  output: string,
  scenario: TestScenario,
  agentPrompt: string
): Promise<EvaluationResult> {
  const evaluationPrompt = `
    You are evaluating an AI agent's output.

    Agent Prompt: ${agentPrompt}
    Scenario: ${scenario.description}
    Input: ${JSON.stringify(scenario.input)}
    Output: ${output}

    Evaluate on these criteria:
    ${Object.entries(scenario.evaluationCriteria)
      .map(([name, config]) =>
        `- ${name}: ${config.checks.join(", ")}`
      ).join("\n")}

    Return JSON with scores (0-100) for each criterion.
  `;

  // Call your LLM API here
  const response = await callLLM(evaluationPrompt);
  return JSON.parse(response);
}
```

## Troubleshooting

### Common Issues

**"No scenario file found for agent X"**
- Create a scenario file: `scenarios/agent-X-scenarios.json`
- Follow the schema in this README

**"No agent file found for agent X"**
- Ensure agent file exists: `agents/agent-X-*.md`
- Check file naming convention

**Low scores across all scenarios**
- Review agent prompt for missing instructions
- Check if required sections are clearly defined
- Ensure examples are provided in the prompt

**Guardrail violations**
- Review the agent's guardrails section
- Add explicit negative examples
- Strengthen boundary instructions

## Contributing

When adding new test scenarios:
1. Follow the existing JSON schema
2. Include at least 3 standard scenarios and 2 edge cases
3. Document expected behavior for edge cases
4. Run tests locally before committing
5. Update this README if adding new features
