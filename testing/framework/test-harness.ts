/**
 * Agent Testing Framework - Core Test Harness
 *
 * This framework enables systematic testing of AI agents by:
 * 1. Providing standardized test inputs
 * 2. Capturing agent outputs
 * 3. Evaluating against quality criteria
 * 4. Generating improvement recommendations
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface AgentConfig {
  id: number;
  name: string;
  promptFile: string;
  requiredSections: string[];
  handoffArtifact: string;
  evaluationCriteria: EvaluationCriteria;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  targetAgent: number;
  input: string;
  context?: Record<string, unknown>;
  expectedOutputs: ExpectedOutput[];
  edgeCases?: EdgeCase[];
}

interface ExpectedOutput {
  section: string;
  mustContain?: string[];
  mustNotContain?: string[];
  format?: "markdown" | "yaml" | "json" | "code";
  minLength?: number;
  maxLength?: number;
}

interface EdgeCase {
  name: string;
  input: string;
  expectedBehavior: string;
}

interface EvaluationCriteria {
  completeness: CompletenessCheck[];
  quality: QualityCheck[];
  consistency: ConsistencyCheck[];
  guardrails: GuardrailCheck[];
}

interface CompletenessCheck {
  name: string;
  required: boolean;
  check: (output: string) => boolean;
  weight: number;
}

interface QualityCheck {
  name: string;
  evaluate: (output: string, context: TestContext) => number; // 0-1 score
  weight: number;
}

interface ConsistencyCheck {
  name: string;
  compareWith: string; // Previous agent output or standard
  evaluate: (output: string, reference: string) => number;
}

interface GuardrailCheck {
  name: string;
  mustNotViolate: (output: string) => boolean;
  severity: "critical" | "warning";
}

interface TestResult {
  scenarioId: string;
  agentId: number;
  timestamp: Date;
  duration: number;
  scores: {
    completeness: number;
    quality: number;
    consistency: number;
    guardrails: { passed: boolean; violations: string[] };
  };
  overallScore: number;
  output: string;
  issues: Issue[];
  recommendations: string[];
}

interface Issue {
  severity: "critical" | "major" | "minor";
  category: string;
  description: string;
  location?: string;
  suggestion?: string;
}

interface TestContext {
  scenario: TestScenario;
  previousOutputs: Map<number, string>;
  startTime: Date;
}

// ============================================================================
// Agent Configuration Registry
// ============================================================================

const AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 0,
    name: "Orchestrator",
    promptFile: "agent-0-orchestrator.md",
    requiredSections: [
      "Project Status",
      "Reasoning",
      "Risks & Blockers",
      "Recommended Actions",
    ],
    handoffArtifact: "orchestration-plan",
    evaluationCriteria: {
      completeness: [
        {
          name: "Project status included",
          required: true,
          check: (o) => o.includes("## Project Status"),
          weight: 1,
        },
        {
          name: "Gate assessment",
          required: true,
          check: (o) => /Gate \d/.test(o),
          weight: 1,
        },
        {
          name: "Action recommendations",
          required: true,
          check: (o) => o.includes("Recommended Actions"),
          weight: 1,
        },
        {
          name: "Ready-to-paste prompts",
          required: true,
          check: (o) => o.includes("<prompt>"),
          weight: 1,
        },
      ],
      quality: [
        {
          name: "Reasoning shown",
          evaluate: (o) => (o.includes("<thinking>") ? 1 : 0),
          weight: 1,
        },
        {
          name: "Risks are specific",
          evaluate: (o) => {
            const riskSection = o.match(
              /## Risks.*?(?=##|$)/s
            )?.[0];
            if (!riskSection) return 0;
            // Check for specific project-related risks
            return riskSection.length > 200 ? 1 : 0.5;
          },
          weight: 1,
        },
      ],
      consistency: [],
      guardrails: [
        {
          name: "Max 3 actions",
          mustNotViolate: (o) =>
            (o.match(/### Action \d/g) || []).length <= 3,
          severity: "warning",
        },
        {
          name: "No vague language",
          mustNotViolate: (o) =>
            !/(soon|eventually|might|maybe|probably)/i.test(o),
          severity: "warning",
        },
      ],
    },
  },
  {
    id: 1,
    name: "Problem Framer",
    promptFile: "agent-1-problem-framer.md",
    requiredSections: [
      "Discovery",
      "Framing",
      "Problem Brief",
    ],
    handoffArtifact: "problem-brief-v0.1.md",
    evaluationCriteria: {
      completeness: [
        {
          name: "Discovery questions asked",
          required: true,
          check: (o) => (o.match(/\?/g) || []).length >= 8,
          weight: 1,
        },
        {
          name: "Three framings provided",
          required: true,
          check: (o) =>
            o.includes("Narrow") &&
            o.includes("Balanced") &&
            o.includes("Broad"),
          weight: 1,
        },
        {
          name: "Explicit recommendation",
          required: true,
          check: (o) => /recommend/i.test(o),
          weight: 1,
        },
        {
          name: "Target persona defined",
          required: true,
          check: (o) => /persona|target user/i.test(o),
          weight: 1,
        },
        {
          name: "JTBD included",
          required: true,
          check: (o) => /When.*want.*so/i.test(o),
          weight: 1,
        },
      ],
      quality: [
        {
          name: "Problem is falsifiable",
          evaluate: (o) => {
            // Check if problem statement includes measurable criteria
            return /\d+%|\$\d+|\d+ (users|minutes|hours)/i.test(o) ? 1 : 0.5;
          },
          weight: 1.5,
        },
        {
          name: "User specificity",
          evaluate: (o) => {
            // Check for specific user characteristics
            const hasRole = /role:|title:|job:/i.test(o);
            const hasContext = /company size|industry|environment/i.test(o);
            return hasRole && hasContext ? 1 : hasRole ? 0.5 : 0;
          },
          weight: 1.5,
        },
      ],
      consistency: [],
      guardrails: [
        {
          name: "No 'everyone' as target",
          mustNotViolate: (o) => !/target.*everyone/i.test(o),
          severity: "critical",
        },
        {
          name: "Includes constraints",
          mustNotViolate: (o) => /constraint|timeline|budget/i.test(o),
          severity: "warning",
        },
      ],
    },
  },
  {
    id: 6,
    name: "Engineer",
    promptFile: "agent-6-engineer.md",
    requiredSections: [
      "Implementation Summary",
      "Acceptance Criteria Verification",
      "Testing",
    ],
    handoffArtifact: "code + test report",
    evaluationCriteria: {
      completeness: [
        {
          name: "PRD reference",
          required: true,
          check: (o) => /PRD|acceptance criteria/i.test(o),
          weight: 1,
        },
        {
          name: "Code examples typed",
          required: true,
          check: (o) => !o.includes(": any"),
          weight: 1,
        },
        {
          name: "Error handling shown",
          required: true,
          check: (o) => /try.*catch|error/i.test(o),
          weight: 1,
        },
        {
          name: "Tests included",
          required: true,
          check: (o) => /test|spec|describe|it\(/i.test(o),
          weight: 1,
        },
      ],
      quality: [
        {
          name: "TypeScript best practices",
          evaluate: (o) => {
            let score = 0;
            if (!o.includes(": any")) score += 0.25;
            if (o.includes("interface ") || o.includes("type ")) score += 0.25;
            if (o.includes("async ") && o.includes("await ")) score += 0.25;
            if (o.includes("try") && o.includes("catch")) score += 0.25;
            return score;
          },
          weight: 2,
        },
        {
          name: "Security considerations",
          evaluate: (o) => {
            let score = 0;
            if (/validation|sanitiz/i.test(o)) score += 0.33;
            if (/auth|permission|role/i.test(o)) score += 0.33;
            if (/injection|xss|csrf/i.test(o)) score += 0.34;
            return score;
          },
          weight: 1.5,
        },
      ],
      consistency: [],
      guardrails: [
        {
          name: "No secrets in code",
          mustNotViolate: (o) =>
            !/password\s*=\s*["'][^"']+["']|api_key\s*=\s*["'][^"']+["']/i.test(
              o
            ),
          severity: "critical",
        },
        {
          name: "No console.log in production code",
          mustNotViolate: (o) => {
            // Allow console.log in examples but flag if in actual implementation
            const codeBlocks = o.match(/```typescript[\s\S]*?```/g) || [];
            return !codeBlocks.some(
              (block) =>
                block.includes("console.log") && !block.includes("// debug")
            );
          },
          severity: "warning",
        },
      ],
    },
  },
  // Add more agent configs...
];

// ============================================================================
// Test Harness Implementation
// ============================================================================

export class AgentTestHarness {
  private client: Anthropic;
  private agentsDir: string;
  private resultsDir: string;

  constructor(config: { agentsDir: string; resultsDir: string }) {
    this.client = new Anthropic();
    this.agentsDir = config.agentsDir;
    this.resultsDir = config.resultsDir;
  }

  /**
   * Run a single test scenario against an agent
   */
  async runScenario(scenario: TestScenario): Promise<TestResult> {
    const startTime = new Date();
    const agentConfig = AGENT_CONFIGS.find((a) => a.id === scenario.targetAgent);

    if (!agentConfig) {
      throw new Error(`Agent ${scenario.targetAgent} not found`);
    }

    // Load agent prompt
    const agentPrompt = await this.loadAgentPrompt(agentConfig.promptFile);

    // Execute agent
    const output = await this.executeAgent(agentPrompt, scenario.input);

    // Evaluate output
    const result = await this.evaluateOutput(
      output,
      agentConfig,
      scenario,
      startTime
    );

    // Store result
    await this.storeResult(result);

    return result;
  }

  /**
   * Run all scenarios for a specific agent
   */
  async runAgentTests(agentId: number): Promise<TestResult[]> {
    const scenarios = await this.loadScenarios(agentId);
    const results: TestResult[] = [];

    for (const scenario of scenarios) {
      console.log(`Running scenario: ${scenario.name}`);
      const result = await this.runScenario(scenario);
      results.push(result);

      // Run edge cases
      for (const edgeCase of scenario.edgeCases || []) {
        const edgeScenario: TestScenario = {
          ...scenario,
          id: `${scenario.id}-edge-${edgeCase.name}`,
          name: `${scenario.name} - Edge: ${edgeCase.name}`,
          input: edgeCase.input,
        };
        const edgeResult = await this.runScenario(edgeScenario);
        results.push(edgeResult);
      }
    }

    return results;
  }

  /**
   * Run full workflow test (all agents in sequence)
   */
  async runWorkflowTest(workflowScenario: TestScenario): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const context: TestContext = {
      scenario: workflowScenario,
      previousOutputs: new Map(),
      startTime: new Date(),
    };

    // Agent execution order for typical workflow
    const agentOrder = [1, 2, 3, 4, 5, 6, 7];

    for (const agentId of agentOrder) {
      const agentConfig = AGENT_CONFIGS.find((a) => a.id === agentId);
      if (!agentConfig) continue;

      // Build input from previous outputs
      const input = this.buildAgentInput(agentId, context);

      const scenario: TestScenario = {
        ...workflowScenario,
        id: `${workflowScenario.id}-agent-${agentId}`,
        targetAgent: agentId,
        input,
      };

      const result = await this.runScenario(scenario);
      results.push(result);

      // Store output for next agent
      context.previousOutputs.set(agentId, result.output);

      // Check for blocking issues
      if (!result.scores.guardrails.passed) {
        console.warn(`Agent ${agentId} has guardrail violations, stopping workflow`);
        break;
      }
    }

    return results;
  }

  /**
   * Load agent prompt from file
   */
  private async loadAgentPrompt(filename: string): Promise<string> {
    const filepath = path.join(this.agentsDir, filename);
    return await fs.readFile(filepath, "utf-8");
  }

  /**
   * Execute agent with given prompt and input
   */
  private async executeAgent(
    systemPrompt: string,
    userInput: string
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userInput }],
    });

    return response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("\n");
  }

  /**
   * Evaluate agent output against criteria
   */
  private async evaluateOutput(
    output: string,
    agentConfig: AgentConfig,
    scenario: TestScenario,
    startTime: Date
  ): Promise<TestResult> {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    // Completeness scoring
    let completenessScore = 0;
    let completenessWeight = 0;

    for (const check of agentConfig.evaluationCriteria.completeness) {
      completenessWeight += check.weight;
      if (check.check(output)) {
        completenessScore += check.weight;
      } else {
        issues.push({
          severity: check.required ? "major" : "minor",
          category: "completeness",
          description: `Missing: ${check.name}`,
          suggestion: `Ensure output includes ${check.name}`,
        });
      }
    }
    completenessScore =
      completenessWeight > 0 ? completenessScore / completenessWeight : 0;

    // Quality scoring
    let qualityScore = 0;
    let qualityWeight = 0;

    for (const check of agentConfig.evaluationCriteria.quality) {
      qualityWeight += check.weight;
      const score = check.evaluate(output, {
        scenario,
        previousOutputs: new Map(),
        startTime,
      });
      qualityScore += score * check.weight;

      if (score < 0.5) {
        issues.push({
          severity: "minor",
          category: "quality",
          description: `Low score for: ${check.name}`,
          suggestion: `Improve ${check.name} for better output quality`,
        });
      }
    }
    qualityScore = qualityWeight > 0 ? qualityScore / qualityWeight : 0;

    // Guardrail checks
    const guardrailViolations: string[] = [];
    for (const check of agentConfig.evaluationCriteria.guardrails) {
      if (!check.mustNotViolate(output)) {
        guardrailViolations.push(check.name);
        issues.push({
          severity: check.severity === "critical" ? "critical" : "major",
          category: "guardrail",
          description: `Guardrail violation: ${check.name}`,
        });
      }
    }

    // Generate recommendations
    if (completenessScore < 0.8) {
      recommendations.push(
        "Review required sections and ensure all are present"
      );
    }
    if (qualityScore < 0.7) {
      recommendations.push(
        "Focus on specificity and actionability of outputs"
      );
    }
    if (guardrailViolations.length > 0) {
      recommendations.push(
        `Address guardrail violations: ${guardrailViolations.join(", ")}`
      );
    }

    const overallScore =
      completenessScore * 0.3 +
      qualityScore * 0.4 +
      (guardrailViolations.length === 0 ? 0.3 : 0);

    return {
      scenarioId: scenario.id,
      agentId: scenario.targetAgent,
      timestamp: new Date(),
      duration: Date.now() - startTime.getTime(),
      scores: {
        completeness: completenessScore,
        quality: qualityScore,
        consistency: 0, // TODO: Implement
        guardrails: {
          passed: guardrailViolations.length === 0,
          violations: guardrailViolations,
        },
      },
      overallScore,
      output,
      issues,
      recommendations,
    };
  }

  /**
   * Build input for next agent based on previous outputs
   */
  private buildAgentInput(
    agentId: number,
    context: TestContext
  ): string {
    // This would be customized based on agent handoff requirements
    const previousOutputs = Array.from(context.previousOutputs.entries())
      .map(([id, output]) => `## Agent ${id} Output\n${output}`)
      .join("\n\n");

    return `${context.scenario.input}\n\n## Context from Previous Agents\n${previousOutputs}`;
  }

  /**
   * Load test scenarios for an agent
   */
  private async loadScenarios(agentId: number): Promise<TestScenario[]> {
    const scenariosDir = path.join(
      path.dirname(this.agentsDir),
      "testing",
      "scenarios"
    );
    const scenarioFile = path.join(scenariosDir, `agent-${agentId}-scenarios.json`);

    try {
      const content = await fs.readFile(scenarioFile, "utf-8");
      return JSON.parse(content);
    } catch {
      console.warn(`No scenarios found for agent ${agentId}`);
      return [];
    }
  }

  /**
   * Store test result
   */
  private async storeResult(result: TestResult): Promise<void> {
    const filename = `${result.scenarioId}-${result.timestamp.toISOString()}.json`;
    const filepath = path.join(this.resultsDir, filename);

    await fs.mkdir(this.resultsDir, { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(result, null, 2));
  }
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Compare two agent versions
 */
export async function compareAgentVersions(
  harness: AgentTestHarness,
  agentId: number,
  scenarios: TestScenario[]
): Promise<{
  improved: string[];
  regressed: string[];
  unchanged: string[];
}> {
  // Run current version
  const currentResults: TestResult[] = [];
  for (const scenario of scenarios) {
    currentResults.push(await harness.runScenario(scenario));
  }

  // Compare with stored baseline (would need baseline storage)
  // For now, just return current scores
  return {
    improved: currentResults
      .filter((r) => r.overallScore >= 0.8)
      .map((r) => r.scenarioId),
    regressed: currentResults
      .filter((r) => r.overallScore < 0.5)
      .map((r) => r.scenarioId),
    unchanged: currentResults
      .filter((r) => r.overallScore >= 0.5 && r.overallScore < 0.8)
      .map((r) => r.scenarioId),
  };
}

/**
 * Generate improvement report
 */
export function generateImprovementReport(results: TestResult[]): string {
  const byAgent = new Map<number, TestResult[]>();

  for (const result of results) {
    const existing = byAgent.get(result.agentId) || [];
    existing.push(result);
    byAgent.set(result.agentId, existing);
  }

  let report = "# Agent Improvement Report\n\n";

  for (const [agentId, agentResults] of byAgent) {
    const avgScore =
      agentResults.reduce((sum, r) => sum + r.overallScore, 0) /
      agentResults.length;

    report += `## Agent ${agentId}\n`;
    report += `**Average Score:** ${(avgScore * 100).toFixed(1)}%\n\n`;

    // Aggregate issues
    const issuesByCategory = new Map<string, Issue[]>();
    for (const result of agentResults) {
      for (const issue of result.issues) {
        const existing = issuesByCategory.get(issue.category) || [];
        existing.push(issue);
        issuesByCategory.set(issue.category, existing);
      }
    }

    report += "### Common Issues\n";
    for (const [category, issues] of issuesByCategory) {
      report += `- **${category}**: ${issues.length} occurrences\n`;
      const uniqueDescriptions = [...new Set(issues.map((i) => i.description))];
      for (const desc of uniqueDescriptions.slice(0, 3)) {
        report += `  - ${desc}\n`;
      }
    }

    report += "\n### Recommendations\n";
    const allRecommendations = agentResults.flatMap((r) => r.recommendations);
    const uniqueRecs = [...new Set(allRecommendations)];
    for (const rec of uniqueRecs) {
      report += `- ${rec}\n`;
    }

    report += "\n---\n\n";
  }

  return report;
}
