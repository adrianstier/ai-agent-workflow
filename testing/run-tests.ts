#!/usr/bin/env node
/**
 * Agent Testing CLI
 *
 * Command-line interface for running agent tests, generating scorecards,
 * and tracking improvements over time.
 *
 * Usage:
 *   node run-tests.js --agent 1          # Test specific agent
 *   node run-tests.js --all              # Test all agents
 *   node run-tests.js --agent 1 --save   # Save results to history
 *   node run-tests.js --compare 1        # Compare agent versions
 *   node run-tests.js --report           # Generate summary report
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  scenariosDir: path.join(__dirname, "scenarios"),
  resultsDir: path.join(__dirname, "results"),
  reportsDir: path.join(__dirname, "reports"),
  agentsDir: path.join(__dirname, "..", "agents"),
  historyFile: path.join(__dirname, "results", "history.json"),
};

// ============================================================================
// Types
// ============================================================================

interface TestScenario {
  id: string;
  name: string;
  description: string;
  input: Record<string, unknown>;
  expectedOutput: {
    mustContain: string[];
    structure?: Record<string, boolean>;
  };
  evaluationCriteria: Record<
    string,
    {
      weight: number;
      checks: string[];
    }
  >;
}

interface ScenarioFile {
  agentId: number;
  agentName: string;
  scenarios: TestScenario[];
  edgeCases?: Array<{
    id: string;
    name: string;
    description: string;
    input: Record<string, unknown>;
    expectedBehavior: string;
    guardrailCheck: boolean;
  }>;
  guardrails?: {
    mustNotContain?: string[];
    mustWarn?: string[];
    bestPractices?: string[];
  };
}

interface TestResult {
  scenarioId: string;
  scenarioName: string;
  passed: boolean;
  score: number;
  details: {
    mustContainResults: Array<{ term: string; found: boolean }>;
    criteriaScores: Record<string, number>;
    guardrailViolations: string[];
  };
  output?: string;
  duration: number;
  timestamp: Date;
}

interface AgentTestSummary {
  agentId: number;
  agentName: string;
  overallScore: number;
  passRate: number;
  scenarioResults: TestResult[];
  recommendations: string[];
  testDate: Date;
}

interface TestHistory {
  entries: Array<{
    agentId: number;
    date: string;
    version: string;
    overallScore: number;
    passRate: number;
  }>;
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

interface CLIArgs {
  agent?: number;
  all?: boolean;
  save?: boolean;
  compare?: number;
  report?: boolean;
  verbose?: boolean;
  help?: boolean;
  scenario?: string;
  dryRun?: boolean;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case "--agent":
      case "-a":
        args.agent = parseInt(argv[++i], 10);
        break;
      case "--all":
        args.all = true;
        break;
      case "--save":
      case "-s":
        args.save = true;
        break;
      case "--compare":
      case "-c":
        args.compare = parseInt(argv[++i], 10);
        break;
      case "--report":
      case "-r":
        args.report = true;
        break;
      case "--verbose":
      case "-v":
        args.verbose = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--scenario":
        args.scenario = argv[++i];
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
    }
  }

  return args;
}

function showHelp(): void {
  console.log(`
Agent Testing CLI

Usage:
  npx ts-node run-tests.ts [options]

Options:
  --agent, -a <id>    Test a specific agent by ID
  --all               Test all agents with scenario files
  --save, -s          Save results to history
  --compare, -c <id>  Compare agent's current vs historical performance
  --report, -r        Generate summary report for all agents
  --scenario <id>     Run a specific scenario only
  --verbose, -v       Show detailed output
  --dry-run           Show what would be tested without running
  --help, -h          Show this help message

Examples:
  npx ts-node run-tests.ts --agent 1
  npx ts-node run-tests.ts --agent 1 --scenario arch-001
  npx ts-node run-tests.ts --all --save
  npx ts-node run-tests.ts --compare 1
  npx ts-node run-tests.ts --report
`);
}

// ============================================================================
// File Operations
// ============================================================================

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadScenarioFile(agentId: number): ScenarioFile | null {
  const files = fs.readdirSync(CONFIG.scenariosDir);
  const scenarioFile = files.find((f) => f.startsWith(`agent-${agentId}-`));

  if (!scenarioFile) {
    return null;
  }

  const content = fs.readFileSync(
    path.join(CONFIG.scenariosDir, scenarioFile),
    "utf-8"
  );
  return JSON.parse(content) as ScenarioFile;
}

function loadAllScenarioFiles(): ScenarioFile[] {
  const files = fs
    .readdirSync(CONFIG.scenariosDir)
    .filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const content = fs.readFileSync(
      path.join(CONFIG.scenariosDir, f),
      "utf-8"
    );
    return JSON.parse(content) as ScenarioFile;
  });
}

function loadHistory(): TestHistory {
  if (fs.existsSync(CONFIG.historyFile)) {
    const content = fs.readFileSync(CONFIG.historyFile, "utf-8");
    return JSON.parse(content) as TestHistory;
  }
  return { entries: [] };
}

function saveHistory(history: TestHistory): void {
  ensureDir(CONFIG.resultsDir);
  fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2));
}

function loadAgentPrompt(agentId: number): string | null {
  const files = fs.readdirSync(CONFIG.agentsDir);
  const agentFile = files.find((f) => f.startsWith(`agent-${agentId}-`));

  if (!agentFile) {
    return null;
  }

  return fs.readFileSync(path.join(CONFIG.agentsDir, agentFile), "utf-8");
}

// ============================================================================
// Test Execution (Simulated)
// ============================================================================

/**
 * Simulates running a scenario against an agent.
 * In a real implementation, this would call the LLM with the agent prompt
 * and scenario input, then evaluate the response.
 */
async function runScenario(
  scenario: TestScenario,
  agentPrompt: string,
  guardrails?: ScenarioFile["guardrails"]
): Promise<TestResult> {
  const startTime = Date.now();

  // Simulate LLM call - in production, this would be actual API call
  // For now, we generate a mock response based on scenario requirements
  const mockOutput = generateMockOutput(scenario);

  // Evaluate the output
  const mustContainResults = scenario.expectedOutput.mustContain.map(
    (term) => ({
      term,
      found: mockOutput.toLowerCase().includes(term.toLowerCase()),
    })
  );

  const mustContainScore =
    mustContainResults.filter((r) => r.found).length /
    mustContainResults.length;

  // Calculate criteria scores (simulated evaluation)
  const criteriaScores: Record<string, number> = {};
  let totalWeight = 0;
  let weightedScore = 0;

  for (const [criterion, config] of Object.entries(
    scenario.evaluationCriteria
  )) {
    // Simulate scoring - in production, use LLM-as-judge
    const score = 0.7 + Math.random() * 0.25; // Random score between 70-95%
    criteriaScores[criterion] = Math.round(score * 100);
    totalWeight += config.weight;
    weightedScore += score * config.weight;
  }

  // Check guardrails
  const guardrailViolations: string[] = [];
  if (guardrails?.mustNotContain) {
    for (const forbidden of guardrails.mustNotContain) {
      if (mockOutput.toLowerCase().includes(forbidden.toLowerCase())) {
        guardrailViolations.push(`Contains forbidden term: "${forbidden}"`);
      }
    }
  }

  const guardrailScore = guardrailViolations.length === 0 ? 1 : 0;

  // Calculate final score
  const finalScore = Math.round(
    (mustContainScore * 0.3 +
      (weightedScore / totalWeight) * 0.5 +
      guardrailScore * 0.2) *
      100
  );

  const duration = Date.now() - startTime;

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    passed: finalScore >= 70 && guardrailViolations.length === 0,
    score: finalScore,
    details: {
      mustContainResults,
      criteriaScores,
      guardrailViolations,
    },
    output: mockOutput.substring(0, 500) + "...", // Truncate for storage
    duration,
    timestamp: new Date(),
  };
}

function generateMockOutput(scenario: TestScenario): string {
  // Generate a mock output that includes most expected terms
  // In production, this would be the actual LLM response
  const terms = scenario.expectedOutput.mustContain;
  const lines = [
    `# ${scenario.name} Response\n`,
    `## Analysis\n`,
    `Based on the input provided, here is my analysis:\n`,
  ];

  for (const term of terms) {
    lines.push(`- Consideration for ${term}: This aspect is important...\n`);
  }

  lines.push(`\n## Recommendations\n`);
  lines.push(`1. First recommendation based on the analysis\n`);
  lines.push(`2. Second recommendation for implementation\n`);
  lines.push(`3. Third recommendation for best practices\n`);

  return lines.join("");
}

// ============================================================================
// Test Runner
// ============================================================================

async function testAgent(
  agentId: number,
  scenarioId?: string,
  verbose?: boolean
): Promise<AgentTestSummary> {
  const scenarioFile = loadScenarioFile(agentId);
  if (!scenarioFile) {
    throw new Error(`No scenario file found for agent ${agentId}`);
  }

  const agentPrompt = loadAgentPrompt(agentId);
  if (!agentPrompt) {
    throw new Error(`No agent file found for agent ${agentId}`);
  }

  console.log(`\nTesting Agent ${agentId}: ${scenarioFile.agentName}`);
  console.log("=".repeat(50));

  let scenarios = scenarioFile.scenarios;
  if (scenarioId) {
    scenarios = scenarios.filter((s) => s.id === scenarioId);
    if (scenarios.length === 0) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }
  }

  const results: TestResult[] = [];

  for (const scenario of scenarios) {
    if (verbose) {
      console.log(`\n  Running: ${scenario.name}...`);
    }

    const result = await runScenario(
      scenario,
      agentPrompt,
      scenarioFile.guardrails
    );
    results.push(result);

    const status = result.passed ? "✓" : "✗";
    const color = result.passed ? "\x1b[32m" : "\x1b[31m";
    console.log(
      `  ${color}${status}\x1b[0m ${scenario.name}: ${result.score}%`
    );

    if (verbose && result.details.guardrailViolations.length > 0) {
      console.log(
        `    ⚠ Guardrail violations: ${result.details.guardrailViolations.join(", ")}`
      );
    }
  }

  const overallScore = Math.round(
    results.reduce((sum, r) => sum + r.score, 0) / results.length
  );
  const passRate = Math.round(
    (results.filter((r) => r.passed).length / results.length) * 100
  );

  // Generate recommendations based on results
  const recommendations: string[] = [];
  const lowScoreScenarios = results.filter((r) => r.score < 70);
  if (lowScoreScenarios.length > 0) {
    recommendations.push(
      `Review scenarios: ${lowScoreScenarios.map((s) => s.scenarioName).join(", ")}`
    );
  }

  const guardrailIssues = results.flatMap(
    (r) => r.details.guardrailViolations
  );
  if (guardrailIssues.length > 0) {
    recommendations.push(
      `Address guardrail violations: ${[...new Set(guardrailIssues)].join(", ")}`
    );
  }

  console.log("\n" + "-".repeat(50));
  console.log(`Overall Score: ${overallScore}%`);
  console.log(`Pass Rate: ${passRate}% (${results.filter((r) => r.passed).length}/${results.length})`);

  return {
    agentId,
    agentName: scenarioFile.agentName,
    overallScore,
    passRate,
    scenarioResults: results,
    recommendations,
    testDate: new Date(),
  };
}

async function testAllAgents(verbose?: boolean): Promise<AgentTestSummary[]> {
  const scenarioFiles = loadAllScenarioFiles();
  const summaries: AgentTestSummary[] = [];

  for (const file of scenarioFiles) {
    try {
      const summary = await testAgent(file.agentId, undefined, verbose);
      summaries.push(summary);
    } catch (error) {
      console.error(`Failed to test agent ${file.agentId}:`, error);
    }
  }

  return summaries;
}

// ============================================================================
// Comparison & Reporting
// ============================================================================

function compareVersions(agentId: number): void {
  const history = loadHistory();
  const agentHistory = history.entries.filter((e) => e.agentId === agentId);

  if (agentHistory.length < 2) {
    console.log(`Insufficient history for agent ${agentId}. Run more tests with --save.`);
    return;
  }

  console.log(`\nAgent ${agentId} Version Comparison`);
  console.log("=".repeat(50));
  console.log("\nDate                  Version    Score    Pass Rate");
  console.log("-".repeat(50));

  for (const entry of agentHistory.slice(-10)) {
    const scoreChange =
      agentHistory.indexOf(entry) > 0
        ? entry.overallScore - agentHistory[agentHistory.indexOf(entry) - 1].overallScore
        : 0;
    const changeStr = scoreChange >= 0 ? `+${scoreChange}` : `${scoreChange}`;
    console.log(
      `${entry.date.padEnd(20)} ${entry.version.padEnd(10)} ${String(entry.overallScore).padEnd(8)} ${entry.passRate}% (${changeStr})`
    );
  }

  // Calculate trend
  const recent = agentHistory.slice(-3);
  const avgRecent =
    recent.reduce((sum, e) => sum + e.overallScore, 0) / recent.length;
  const older = agentHistory.slice(-6, -3);
  const avgOlder =
    older.length > 0
      ? older.reduce((sum, e) => sum + e.overallScore, 0) / older.length
      : avgRecent;

  const trend =
    avgRecent > avgOlder
      ? "📈 Improving"
      : avgRecent < avgOlder
        ? "📉 Declining"
        : "➡️ Stable";

  console.log(`\nTrend: ${trend}`);
}

function generateReport(): void {
  const scenarioFiles = loadAllScenarioFiles();
  const history = loadHistory();

  console.log("\n" + "=".repeat(60));
  console.log("           AGENT TESTING SUMMARY REPORT");
  console.log("=".repeat(60));
  console.log(`Generated: ${new Date().toISOString()}\n`);

  console.log("Agent Coverage");
  console.log("-".repeat(40));

  for (const file of scenarioFiles) {
    const agentHistory = history.entries.filter((e) => e.agentId === file.agentId);
    const latestScore = agentHistory.length > 0 ? agentHistory[agentHistory.length - 1].overallScore : "N/A";
    const scenarioCount = file.scenarios.length;
    const edgeCaseCount = file.edgeCases?.length || 0;

    console.log(
      `  Agent ${file.agentId}: ${file.agentName.padEnd(25)} ${scenarioCount} scenarios, ${edgeCaseCount} edge cases | Latest: ${latestScore}%`
    );
  }

  // Summary statistics
  const totalScenarios = scenarioFiles.reduce(
    (sum, f) => sum + f.scenarios.length,
    0
  );
  const totalEdgeCases = scenarioFiles.reduce(
    (sum, f) => sum + (f.edgeCases?.length || 0),
    0
  );
  const avgScore =
    history.entries.length > 0
      ? Math.round(
          history.entries.slice(-20).reduce((sum, e) => sum + e.overallScore, 0) /
            Math.min(20, history.entries.length)
        )
      : "N/A";

  console.log("\n" + "-".repeat(40));
  console.log(`Total Agents with Tests: ${scenarioFiles.length}`);
  console.log(`Total Scenarios: ${totalScenarios}`);
  console.log(`Total Edge Cases: ${totalEdgeCases}`);
  console.log(`Average Score (last 20 runs): ${avgScore}%`);
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    return;
  }

  // Ensure directories exist
  ensureDir(CONFIG.resultsDir);
  ensureDir(CONFIG.reportsDir);

  if (args.report) {
    generateReport();
    return;
  }

  if (args.compare !== undefined) {
    compareVersions(args.compare);
    return;
  }

  if (args.dryRun) {
    console.log("\nDry Run - Would test:");
    if (args.all) {
      const files = loadAllScenarioFiles();
      for (const file of files) {
        console.log(`  Agent ${file.agentId}: ${file.agentName} (${file.scenarios.length} scenarios)`);
      }
    } else if (args.agent !== undefined) {
      const file = loadScenarioFile(args.agent);
      if (file) {
        console.log(`  Agent ${file.agentId}: ${file.agentName}`);
        if (args.scenario) {
          console.log(`    Scenario: ${args.scenario}`);
        } else {
          console.log(`    All ${file.scenarios.length} scenarios`);
        }
      }
    }
    return;
  }

  let summaries: AgentTestSummary[] = [];

  if (args.all) {
    summaries = await testAllAgents(args.verbose);
  } else if (args.agent !== undefined) {
    const summary = await testAgent(args.agent, args.scenario, args.verbose);
    summaries = [summary];
  } else {
    showHelp();
    return;
  }

  // Save to history if requested
  if (args.save && summaries.length > 0) {
    const history = loadHistory();
    for (const summary of summaries) {
      history.entries.push({
        agentId: summary.agentId,
        date: new Date().toISOString().split("T")[0],
        version: "current",
        overallScore: summary.overallScore,
        passRate: summary.passRate,
      });
    }
    saveHistory(history);
    console.log("\n✓ Results saved to history");
  }

  // Save detailed results
  if (summaries.length > 0) {
    const resultsFile = path.join(
      CONFIG.resultsDir,
      `run-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    );
    fs.writeFileSync(resultsFile, JSON.stringify(summaries, null, 2));
    console.log(`\n✓ Detailed results saved to: ${resultsFile}`);
  }
}

main().catch(console.error);
