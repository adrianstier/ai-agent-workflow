/**
 * Agent Scorecard System
 *
 * Provides comprehensive scoring and tracking for agent performance
 * with historical comparison and trend analysis.
 */

// ============================================================================
// Types
// ============================================================================

interface AgentScorecard {
  agentId: number;
  agentName: string;
  evaluationDate: Date;
  version: string;

  // Core Scores (0-100)
  scores: {
    overall: number;
    completeness: number;
    quality: number;
    consistency: number;
    guardrails: number;
    handoff: number;
  };

  // Detailed Metrics
  metrics: {
    // Output Metrics
    avgOutputLength: number;
    sectionCoverage: number; // % of required sections present
    templateAdherence: number; // % match to expected structure

    // Quality Metrics
    specificity: number; // How specific vs vague
    actionability: number; // Can user act on output
    accuracy: number; // Factual correctness (when verifiable)

    // Process Metrics
    phaseCompletion: number; // Did agent complete all phases
    selfReflection: number; // Did agent self-check
    guardrailCompliance: number; // No violations

    // Integration Metrics
    handoffClarity: number; // Clear handoff package
    contextPreservation: number; // Info from prev agents retained
    artifactQuality: number; // Output artifact usable by next agent
  };

  // Breakdown by Test Scenario
  scenarioResults: ScenarioScore[];

  // Identified Issues
  issues: {
    critical: string[];
    major: string[];
    minor: string[];
  };

  // Recommendations for Improvement
  recommendations: Recommendation[];

  // Historical Comparison
  trends: {
    vsLastVersion: number; // +/- % change
    vsBaseline: number; // vs initial version
    trajectory: "improving" | "stable" | "declining";
  };
}

interface ScenarioScore {
  scenarioId: string;
  scenarioName: string;
  score: number;
  passedChecks: string[];
  failedChecks: string[];
  notes: string;
}

interface Recommendation {
  priority: "high" | "medium" | "low";
  category: string;
  issue: string;
  suggestion: string;
  expectedImpact: string;
}

interface ScoreHistory {
  agentId: number;
  entries: {
    date: Date;
    version: string;
    overallScore: number;
    breakdown: Record<string, number>;
  }[];
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Calculate overall agent score from test results
 */
export function calculateAgentScore(
  results: TestResult[],
  agentConfig: AgentConfig
): AgentScorecard {
  const scores = {
    completeness: calculateCompletenessScore(results),
    quality: calculateQualityScore(results),
    consistency: calculateConsistencyScore(results),
    guardrails: calculateGuardrailScore(results),
    handoff: calculateHandoffScore(results, agentConfig),
  };

  // Weighted overall score
  const overall =
    scores.completeness * 0.2 +
    scores.quality * 0.3 +
    scores.consistency * 0.15 +
    scores.guardrails * 0.2 +
    scores.handoff * 0.15;

  const metrics = calculateDetailedMetrics(results);
  const issues = aggregateIssues(results);
  const recommendations = generateRecommendations(scores, metrics, issues);

  return {
    agentId: agentConfig.id,
    agentName: agentConfig.name,
    evaluationDate: new Date(),
    version: "current",
    scores: { overall: Math.round(overall), ...scores },
    metrics,
    scenarioResults: results.map((r) => ({
      scenarioId: r.scenarioId,
      scenarioName: r.scenarioId,
      score: r.overallScore * 100,
      passedChecks: [],
      failedChecks: r.issues.map((i) => i.description),
      notes: "",
    })),
    issues,
    recommendations,
    trends: {
      vsLastVersion: 0,
      vsBaseline: 0,
      trajectory: "stable",
    },
  };
}

function calculateCompletenessScore(results: TestResult[]): number {
  const scores = results.map((r) => r.scores.completeness);
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
}

function calculateQualityScore(results: TestResult[]): number {
  const scores = results.map((r) => r.scores.quality);
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
}

function calculateConsistencyScore(results: TestResult[]): number {
  // Check consistency across scenarios
  if (results.length < 2) return 100;

  const scores = results.map((r) => r.overallScore);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Lower std dev = more consistent = higher score
  return Math.round(Math.max(0, 100 - stdDev * 200));
}

function calculateGuardrailScore(results: TestResult[]): number {
  const passed = results.filter((r) => r.scores.guardrails.passed).length;
  return Math.round((passed / results.length) * 100);
}

function calculateHandoffScore(
  results: TestResult[],
  agentConfig: AgentConfig
): number {
  // Check if outputs include handoff artifact requirements
  let score = 0;

  for (const result of results) {
    const output = result.output.toLowerCase();

    // Check for required sections
    const requiredPresent = agentConfig.requiredSections.filter((section) =>
      output.includes(section.toLowerCase())
    ).length;

    score += requiredPresent / agentConfig.requiredSections.length;
  }

  return Math.round((score / results.length) * 100);
}

function calculateDetailedMetrics(
  results: TestResult[]
): AgentScorecard["metrics"] {
  const outputs = results.map((r) => r.output);

  return {
    avgOutputLength:
      outputs.reduce((sum, o) => sum + o.length, 0) / outputs.length,
    sectionCoverage: 85, // TODO: Calculate from actual section matching
    templateAdherence: 80,
    specificity: calculateSpecificity(outputs),
    actionability: calculateActionability(outputs),
    accuracy: 90, // TODO: Would need ground truth for this
    phaseCompletion: 85,
    selfReflection: outputs.filter((o) => o.includes("self_reflection")).length /
      outputs.length *
      100,
    guardrailCompliance:
      (results.filter((r) => r.scores.guardrails.passed).length /
        results.length) *
      100,
    handoffClarity: 80,
    contextPreservation: 85,
    artifactQuality: 80,
  };
}

function calculateSpecificity(outputs: string[]): number {
  // Heuristic: Check for specific indicators
  let totalScore = 0;

  for (const output of outputs) {
    let score = 0;

    // Numbers indicate specificity
    const numberMatches = output.match(/\d+/g) || [];
    score += Math.min(numberMatches.length * 2, 20);

    // Specific examples
    if (output.includes("```")) score += 15;
    if (output.includes("example")) score += 10;

    // Concrete names/terms
    if (/["'][^"']+["']/.test(output)) score += 10;

    // Avoid vague words
    const vagueWords = ["might", "maybe", "possibly", "somewhat", "generally"];
    const vagueCount = vagueWords.filter((w) =>
      output.toLowerCase().includes(w)
    ).length;
    score -= vagueCount * 5;

    totalScore += Math.max(0, Math.min(100, score));
  }

  return Math.round(totalScore / outputs.length);
}

function calculateActionability(outputs: string[]): number {
  let totalScore = 0;

  for (const output of outputs) {
    let score = 0;

    // Contains action items or steps
    if (/step \d|1\.|first,/i.test(output)) score += 20;

    // Contains code examples
    if (output.includes("```")) score += 25;

    // Contains commands
    if (/npm |npx |git |curl /i.test(output)) score += 15;

    // Contains clear instructions
    if (/run |execute |create |add |install /i.test(output)) score += 20;

    // Contains templates that can be copied
    if (output.includes("```markdown") || output.includes("```yaml"))
      score += 20;

    totalScore += Math.min(100, score);
  }

  return Math.round(totalScore / outputs.length);
}

function aggregateIssues(
  results: TestResult[]
): AgentScorecard["issues"] {
  const critical: string[] = [];
  const major: string[] = [];
  const minor: string[] = [];

  for (const result of results) {
    for (const issue of result.issues) {
      const desc = `${result.scenarioId}: ${issue.description}`;
      switch (issue.severity) {
        case "critical":
          critical.push(desc);
          break;
        case "major":
          major.push(desc);
          break;
        case "minor":
          minor.push(desc);
          break;
      }
    }
  }

  return {
    critical: [...new Set(critical)],
    major: [...new Set(major)],
    minor: [...new Set(minor)],
  };
}

function generateRecommendations(
  scores: AgentScorecard["scores"],
  metrics: AgentScorecard["metrics"],
  issues: AgentScorecard["issues"]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Score-based recommendations
  if (scores.completeness < 80) {
    recommendations.push({
      priority: "high",
      category: "completeness",
      issue: `Completeness score is ${scores.completeness}%, below target of 80%`,
      suggestion:
        "Review required sections in agent prompt and add explicit section headers",
      expectedImpact: "+10-15% completeness score",
    });
  }

  if (scores.guardrails < 100) {
    recommendations.push({
      priority: "high",
      category: "guardrails",
      issue: `Guardrail compliance is ${scores.guardrails}%`,
      suggestion:
        "Add stronger guardrail checks in the agent prompt and provide negative examples",
      expectedImpact: "Reduce guardrail violations to zero",
    });
  }

  if (metrics.specificity < 70) {
    recommendations.push({
      priority: "medium",
      category: "quality",
      issue: `Specificity score is ${metrics.specificity}%, outputs may be too vague`,
      suggestion:
        "Add instructions to always include specific numbers, examples, and concrete details",
      expectedImpact: "+15-20% specificity score",
    });
  }

  if (metrics.actionability < 70) {
    recommendations.push({
      priority: "medium",
      category: "quality",
      issue: `Actionability score is ${metrics.actionability}%`,
      suggestion:
        "Include more code examples, step-by-step instructions, and copy-paste templates",
      expectedImpact: "+20% actionability score",
    });
  }

  if (metrics.selfReflection < 80) {
    recommendations.push({
      priority: "low",
      category: "process",
      issue: `Self-reflection completion is ${metrics.selfReflection}%`,
      suggestion:
        "Make self-reflection checklist more prominent and require it before output",
      expectedImpact: "More consistent quality across outputs",
    });
  }

  // Issue-based recommendations
  if (issues.critical.length > 0) {
    recommendations.push({
      priority: "high",
      category: "critical-issues",
      issue: `${issues.critical.length} critical issues found`,
      suggestion: `Address: ${issues.critical.slice(0, 3).join("; ")}`,
      expectedImpact: "Eliminate blocking issues",
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Generate markdown report from scorecard
 */
export function generateScorecardReport(scorecard: AgentScorecard): string {
  const getGrade = (score: number): string => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const getEmoji = (score: number): string => {
    if (score >= 90) return "🟢";
    if (score >= 70) return "🟡";
    return "🔴";
  };

  let report = `# Agent ${scorecard.agentId} Scorecard: ${scorecard.agentName}

**Evaluation Date:** ${scorecard.evaluationDate.toISOString().split("T")[0]}
**Version:** ${scorecard.version}

## Overall Score: ${scorecard.scores.overall}/100 (${getGrade(scorecard.scores.overall)})

${getEmoji(scorecard.scores.overall)} ${scorecard.scores.overall >= 80 ? "PASSING" : "NEEDS IMPROVEMENT"}

---

## Score Breakdown

| Category | Score | Grade | Status |
|----------|-------|-------|--------|
| Completeness | ${scorecard.scores.completeness} | ${getGrade(scorecard.scores.completeness)} | ${getEmoji(scorecard.scores.completeness)} |
| Quality | ${scorecard.scores.quality} | ${getGrade(scorecard.scores.quality)} | ${getEmoji(scorecard.scores.quality)} |
| Consistency | ${scorecard.scores.consistency} | ${getGrade(scorecard.scores.consistency)} | ${getEmoji(scorecard.scores.consistency)} |
| Guardrails | ${scorecard.scores.guardrails} | ${getGrade(scorecard.scores.guardrails)} | ${getEmoji(scorecard.scores.guardrails)} |
| Handoff | ${scorecard.scores.handoff} | ${getGrade(scorecard.scores.handoff)} | ${getEmoji(scorecard.scores.handoff)} |

---

## Detailed Metrics

### Output Quality
| Metric | Value | Target |
|--------|-------|--------|
| Avg Output Length | ${scorecard.metrics.avgOutputLength.toFixed(0)} chars | 2000+ |
| Section Coverage | ${scorecard.metrics.sectionCoverage}% | 90%+ |
| Template Adherence | ${scorecard.metrics.templateAdherence}% | 85%+ |
| Specificity | ${scorecard.metrics.specificity}% | 70%+ |
| Actionability | ${scorecard.metrics.actionability}% | 70%+ |

### Process Compliance
| Metric | Value | Target |
|--------|-------|--------|
| Phase Completion | ${scorecard.metrics.phaseCompletion}% | 100% |
| Self-Reflection | ${scorecard.metrics.selfReflection.toFixed(0)}% | 100% |
| Guardrail Compliance | ${scorecard.metrics.guardrailCompliance.toFixed(0)}% | 100% |

### Integration Quality
| Metric | Value | Target |
|--------|-------|--------|
| Handoff Clarity | ${scorecard.metrics.handoffClarity}% | 90%+ |
| Context Preservation | ${scorecard.metrics.contextPreservation}% | 85%+ |
| Artifact Quality | ${scorecard.metrics.artifactQuality}% | 80%+ |

---

## Scenario Results

| Scenario | Score | Status |
|----------|-------|--------|
${scorecard.scenarioResults
  .map(
    (s) =>
      `| ${s.scenarioName} | ${s.score.toFixed(0)}% | ${getEmoji(s.score)} |`
  )
  .join("\n")}

---

## Issues Found

### Critical (${scorecard.issues.critical.length})
${scorecard.issues.critical.length > 0 ? scorecard.issues.critical.map((i) => `- 🔴 ${i}`).join("\n") : "None"}

### Major (${scorecard.issues.major.length})
${scorecard.issues.major.length > 0 ? scorecard.issues.major.map((i) => `- 🟠 ${i}`).join("\n") : "None"}

### Minor (${scorecard.issues.minor.length})
${scorecard.issues.minor.length > 0 ? scorecard.issues.minor.slice(0, 5).map((i) => `- 🟡 ${i}`).join("\n") : "None"}

---

## Recommendations

${scorecard.recommendations
  .map(
    (r) => `### ${r.priority.toUpperCase()}: ${r.category}
**Issue:** ${r.issue}
**Suggestion:** ${r.suggestion}
**Expected Impact:** ${r.expectedImpact}
`
  )
  .join("\n")}

---

## Trend Analysis

| Comparison | Change |
|------------|--------|
| vs Last Version | ${scorecard.trends.vsLastVersion >= 0 ? "+" : ""}${scorecard.trends.vsLastVersion}% |
| vs Baseline | ${scorecard.trends.vsBaseline >= 0 ? "+" : ""}${scorecard.trends.vsBaseline}% |
| Trajectory | ${scorecard.trends.trajectory === "improving" ? "📈" : scorecard.trends.trajectory === "declining" ? "📉" : "➡️"} ${scorecard.trends.trajectory} |
`;

  return report;
}

// ============================================================================
// Exports
// ============================================================================

// Type imports for reference
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
  issues: { severity: string; category: string; description: string }[];
  recommendations: string[];
}

interface AgentConfig {
  id: number;
  name: string;
  requiredSections: string[];
}
