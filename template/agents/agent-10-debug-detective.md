# Agent 10: Debug Detective

## Role
Core debugging orchestrator that coordinates all debugging efforts, triages issues, and routes problems to specialized debugging agents.

## Core Responsibilities
- Triage and classify bugs by type (visual, performance, network, state, memory)
- Coordinate multi-agent debugging workflows
- Synthesize findings from specialized debuggers
- Create reproducible test cases
- Document root causes and fixes

## Debugging Triage Framework

### Issue Classification Matrix

```typescript
interface BugReport {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  environment: {
    browser: string;
    os: string;
    viewport: string;
    userAgent: string;
  };
  attachments: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  classification?: BugClassification;
}

type BugClassification =
  | 'visual-regression'      // → Agent 11: Visual Debug Specialist
  | 'performance'            // → Agent 12: Performance Profiler
  | 'network-api'            // → Agent 13: Network Inspector
  | 'state-management'       // → Agent 14: State Debugger
  | 'runtime-error'          // → Agent 15: Error Tracker
  | 'memory-leak'            // → Agent 16: Memory Leak Hunter
  | 'cross-browser'          // → Multi-agent coordination
  | 'intermittent'           // → Special investigation protocol
  | 'unknown';               // → Full diagnostic sweep
```

### Automated Issue Classification

```typescript
// debug-detective/classifier.ts
import Anthropic from '@anthropic-ai/sdk';

interface ClassificationResult {
  classification: BugClassification;
  confidence: number;
  reasoning: string;
  suggestedAgents: number[];
  initialSteps: string[];
}

async function classifyBug(report: BugReport): Promise<ClassificationResult> {
  const client = new Anthropic();

  const prompt = `Analyze this bug report and classify it:

Title: ${report.title}
Description: ${report.description}
Steps to Reproduce:
${report.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Expected: ${report.expected}
Actual: ${report.actual}

Classify as one of:
- visual-regression: UI rendering issues, layout problems, styling bugs
- performance: Slow loading, janky animations, high CPU/memory
- network-api: Failed requests, incorrect data, CORS issues
- state-management: Wrong data displayed, stale state, sync issues
- runtime-error: JavaScript errors, crashes, exceptions
- memory-leak: Growing memory usage, performance degradation over time
- cross-browser: Works in one browser but not another
- intermittent: Sometimes works, sometimes doesn't

Provide:
1. Classification
2. Confidence (0-100)
3. Reasoning
4. Which debug agents to involve (10-16)
5. Initial debugging steps`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });

  // Parse AI response into structured result
  return parseClassificationResponse(response);
}
```

## Playwright-Powered Diagnostic Suite

### Initial Diagnostic Capture

```typescript
// debug-detective/diagnostic-capture.ts
import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs';

interface DiagnosticReport {
  timestamp: string;
  url: string;
  screenshots: string[];
  console: ConsoleMessage[];
  network: NetworkRequest[];
  performance: PerformanceMetrics;
  accessibility: AccessibilityIssue[];
  coverage: CoverageReport;
}

async function captureFullDiagnostic(
  url: string,
  reproSteps: () => Promise<void>
): Promise<DiagnosticReport> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-precise-memory-info']
  });

  const context = await browser.newContext({
    recordVideo: { dir: 'debug-videos/' },
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Collect all diagnostic data
  const consoleMessages: ConsoleMessage[] = [];
  const networkRequests: NetworkRequest[] = [];
  const screenshots: string[] = [];

  // Console logging
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: Date.now()
    });
  });

  // Network monitoring
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      timestamp: Date.now(),
      type: 'request'
    });
  });

  page.on('response', response => {
    const request = networkRequests.find(r => r.url === response.url());
    if (request) {
      request.status = response.status();
      request.responseHeaders = response.headers();
      request.responseTime = Date.now() - request.timestamp;
    }
  });

  // Start coverage collection
  await page.coverage.startJSCoverage();
  await page.coverage.startCSSCoverage();

  // Navigate and capture initial state
  await page.goto(url);
  screenshots.push(await captureAnnotatedScreenshot(page, 'initial'));

  // Execute reproduction steps with screenshots
  await reproSteps();
  screenshots.push(await captureAnnotatedScreenshot(page, 'after-repro'));

  // Collect coverage
  const jsCoverage = await page.coverage.stopJSCoverage();
  const cssCoverage = await page.coverage.stopCSSCoverage();

  // Performance metrics
  const performance = await page.evaluate(() => ({
    timing: performance.timing,
    memory: (performance as any).memory,
    entries: performance.getEntriesByType('resource')
  }));

  // Accessibility scan
  const accessibility = await runAccessibilityScan(page);

  await browser.close();

  return {
    timestamp: new Date().toISOString(),
    url,
    screenshots,
    console: consoleMessages,
    network: networkRequests,
    performance,
    accessibility,
    coverage: { js: jsCoverage, css: cssCoverage }
  };
}

async function captureAnnotatedScreenshot(
  page: Page,
  name: string
): Promise<string> {
  const path = `debug-screenshots/${name}-${Date.now()}.png`;
  await page.screenshot({
    path,
    fullPage: true,
    animations: 'disabled'
  });
  return path;
}
```

### Reproduction Automation

```typescript
// debug-detective/reproducer.ts
import { test, expect, Page } from '@playwright/test';

interface ReproductionScript {
  name: string;
  steps: ReproStep[];
  assertions: Assertion[];
}

type ReproStep =
  | { action: 'navigate'; url: string }
  | { action: 'click'; selector: string }
  | { action: 'fill'; selector: string; value: string }
  | { action: 'wait'; milliseconds: number }
  | { action: 'scroll'; selector: string }
  | { action: 'hover'; selector: string }
  | { action: 'keyboard'; key: string }
  | { action: 'screenshot'; name: string };

async function executeReproduction(
  page: Page,
  script: ReproductionScript
): Promise<ReproductionResult> {
  const results: StepResult[] = [];

  for (const step of script.steps) {
    const startTime = Date.now();
    try {
      await executeStep(page, step);
      results.push({
        step,
        success: true,
        duration: Date.now() - startTime
      });
    } catch (error) {
      // Capture failure state
      await page.screenshot({
        path: `debug-failures/${script.name}-step-${results.length}.png`
      });

      results.push({
        step,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      });
      break;
    }
  }

  return {
    script,
    results,
    allPassed: results.every(r => r.success)
  };
}

async function executeStep(page: Page, step: ReproStep): Promise<void> {
  switch (step.action) {
    case 'navigate':
      await page.goto(step.url);
      break;
    case 'click':
      await page.click(step.selector);
      break;
    case 'fill':
      await page.fill(step.selector, step.value);
      break;
    case 'wait':
      await page.waitForTimeout(step.milliseconds);
      break;
    case 'scroll':
      await page.locator(step.selector).scrollIntoViewIfNeeded();
      break;
    case 'hover':
      await page.hover(step.selector);
      break;
    case 'keyboard':
      await page.keyboard.press(step.key);
      break;
    case 'screenshot':
      await page.screenshot({ path: `debug-screenshots/${step.name}.png` });
      break;
  }
}
```

## AI-Powered Root Cause Analysis

### Diagnostic Synthesis

```typescript
// debug-detective/root-cause-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

interface RootCauseAnalysis {
  summary: string;
  rootCause: string;
  confidence: number;
  evidence: Evidence[];
  suggestedFixes: Fix[];
  preventionMeasures: string[];
}

async function analyzeRootCause(
  diagnostic: DiagnosticReport,
  agentFindings: AgentFinding[]
): Promise<RootCauseAnalysis> {
  const client = new Anthropic();

  // Prepare visual evidence for multimodal analysis
  const screenshotData = await Promise.all(
    diagnostic.screenshots.map(async (path) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: 'image/png' as const,
        data: fs.readFileSync(path).toString('base64')
      }
    }))
  );

  const analysisPrompt = `You are a senior debugging expert. Analyze all evidence to determine the root cause.

## Console Messages
${diagnostic.console.map(c => `[${c.type}] ${c.text}`).join('\n')}

## Network Issues
${diagnostic.network
  .filter(n => n.status >= 400 || n.responseTime > 3000)
  .map(n => `${n.method} ${n.url} - ${n.status} (${n.responseTime}ms)`)
  .join('\n')}

## Agent Findings
${agentFindings.map(f => `### ${f.agent}\n${f.findings}`).join('\n\n')}

## Performance Metrics
- DOM Content Loaded: ${diagnostic.performance.timing.domContentLoadedEventEnd - diagnostic.performance.timing.navigationStart}ms
- Load Complete: ${diagnostic.performance.timing.loadEventEnd - diagnostic.performance.timing.navigationStart}ms
- Memory: ${JSON.stringify(diagnostic.performance.memory)}

Provide:
1. One-sentence summary
2. Root cause explanation
3. Confidence level (0-100)
4. Key evidence supporting your conclusion
5. Specific code fixes with file paths and line numbers
6. Prevention measures for the future`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        ...screenshotData,
        { type: 'text', text: analysisPrompt }
      ]
    }]
  });

  return parseRootCauseResponse(response);
}
```

## Multi-Agent Debugging Coordination

### Debugging Workflow Orchestration

```typescript
// debug-detective/orchestrator.ts

interface DebuggingWorkflow {
  bugReport: BugReport;
  agents: AgentAssignment[];
  timeline: WorkflowStep[];
  status: 'pending' | 'in-progress' | 'resolved' | 'escalated';
}

interface AgentAssignment {
  agentId: number;
  agentName: string;
  priority: number;
  dependencies: number[];
  status: 'waiting' | 'running' | 'complete' | 'blocked';
}

async function orchestrateDebugging(
  bugReport: BugReport
): Promise<DebuggingWorkflow> {
  // Step 1: Classify the bug
  const classification = await classifyBug(bugReport);

  // Step 2: Determine agent assignments
  const agents = determineAgentAssignments(classification);

  // Step 3: Run initial diagnostic capture
  const diagnostic = await captureFullDiagnostic(
    bugReport.environment.url,
    () => executeReproSteps(bugReport.steps)
  );

  // Step 4: Execute agent investigations in parallel/sequence
  const findings: AgentFinding[] = [];

  for (const agent of agents.sort((a, b) => a.priority - b.priority)) {
    // Check dependencies
    const depsComplete = agent.dependencies.every(
      depId => findings.some(f => f.agentId === depId)
    );

    if (!depsComplete) continue;

    const agentFinding = await executeAgentInvestigation(
      agent,
      bugReport,
      diagnostic,
      findings
    );

    findings.push(agentFinding);
  }

  // Step 5: Synthesize root cause
  const rootCause = await analyzeRootCause(diagnostic, findings);

  // Step 6: Generate fix recommendations
  const fixes = await generateFixRecommendations(rootCause, bugReport);

  return {
    bugReport,
    agents,
    timeline: buildTimeline(findings, rootCause),
    status: rootCause.confidence > 80 ? 'resolved' : 'escalated'
  };
}

function determineAgentAssignments(
  classification: ClassificationResult
): AgentAssignment[] {
  const assignments: AgentAssignment[] = [];

  // Always include Error Tracker for initial analysis
  assignments.push({
    agentId: 15,
    agentName: 'Error Tracker',
    priority: 1,
    dependencies: [],
    status: 'waiting'
  });

  // Add specialized agents based on classification
  switch (classification.classification) {
    case 'visual-regression':
      assignments.push({
        agentId: 11,
        agentName: 'Visual Debug Specialist',
        priority: 2,
        dependencies: [15],
        status: 'waiting'
      });
      break;

    case 'performance':
      assignments.push({
        agentId: 12,
        agentName: 'Performance Profiler',
        priority: 2,
        dependencies: [15],
        status: 'waiting'
      });
      assignments.push({
        agentId: 16,
        agentName: 'Memory Leak Hunter',
        priority: 3,
        dependencies: [12],
        status: 'waiting'
      });
      break;

    case 'network-api':
      assignments.push({
        agentId: 13,
        agentName: 'Network Inspector',
        priority: 2,
        dependencies: [15],
        status: 'waiting'
      });
      break;

    case 'state-management':
      assignments.push({
        agentId: 14,
        agentName: 'State Debugger',
        priority: 2,
        dependencies: [15],
        status: 'waiting'
      });
      break;

    case 'memory-leak':
      assignments.push({
        agentId: 16,
        agentName: 'Memory Leak Hunter',
        priority: 2,
        dependencies: [15],
        status: 'waiting'
      });
      assignments.push({
        agentId: 12,
        agentName: 'Performance Profiler',
        priority: 3,
        dependencies: [16],
        status: 'waiting'
      });
      break;

    case 'intermittent':
      // Full sweep for intermittent issues
      [11, 12, 13, 14, 16].forEach((id, index) => {
        assignments.push({
          agentId: id,
          agentName: getAgentName(id),
          priority: 2,
          dependencies: [15],
          status: 'waiting'
        });
      });
      break;
  }

  return assignments;
}
```

## Debugging Session Management

### Interactive Debug Console

```typescript
// debug-detective/debug-session.ts
import { WebSocketServer } from 'ws';
import { chromium } from '@playwright/test';

interface DebugSession {
  id: string;
  browser: Browser;
  page: Page;
  recordings: Recording[];
  breakpoints: Breakpoint[];
  watchers: Watcher[];
}

async function startDebugSession(
  bugReport: BugReport
): Promise<DebugSession> {
  const browser = await chromium.launch({
    headless: false, // Visual debugging
    devtools: true,  // Open DevTools
    slowMo: 100      // Slow down for observation
  });

  const context = await browser.newContext({
    recordVideo: { dir: 'debug-sessions/' }
  });

  const page = await context.newPage();

  // Inject debugging helpers
  await page.addInitScript(() => {
    // Global debug utilities
    window.__DEBUG__ = {
      logs: [],
      networkRequests: [],
      stateSnapshots: [],

      log(message: string, data?: any) {
        this.logs.push({ message, data, timestamp: Date.now() });
        console.log(`[DEBUG] ${message}`, data);
      },

      snapshot(name: string) {
        this.stateSnapshots.push({
          name,
          timestamp: Date.now(),
          state: this.captureState()
        });
      },

      captureState() {
        // Capture Redux/Zustand/React state
        return {
          redux: window.__REDUX_DEVTOOLS_EXTENSION__?.(),
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage }
        };
      }
    };
  });

  return {
    id: generateSessionId(),
    browser,
    page,
    recordings: [],
    breakpoints: [],
    watchers: []
  };
}
```

## Deliverables

### Bug Investigation Report Template

```markdown
# Bug Investigation Report

## Bug ID: [ID]
**Classification:** [Type]
**Priority:** [Level]
**Status:** [Resolved/Escalated]

## Summary
[One-sentence description of the issue and its root cause]

## Reproduction Steps
1. [Step 1]
2. [Step 2]
3. ...

## Investigation Timeline

| Time | Agent | Finding |
|------|-------|---------|
| 00:00 | Debug Detective | Initial triage - classified as [type] |
| 00:05 | Error Tracker | Found [X] console errors |
| 00:10 | [Specialist] | [Key finding] |

## Root Cause Analysis

### Technical Details
[Detailed explanation of why the bug occurs]

### Evidence
- Screenshot: [link]
- Console log: [relevant entries]
- Network trace: [relevant requests]

## Recommended Fixes

### Primary Fix
**File:** `src/components/Example.tsx`
**Line:** 42

```typescript
// Before
const data = response.data;

// After
const data = response.data ?? [];
```

### Secondary Improvements
1. [Additional fix]
2. [Additional fix]

## Prevention Measures
- [ ] Add unit test for edge case
- [ ] Add E2E test for reproduction steps
- [ ] Update error handling patterns
- [ ] Add monitoring for this error type

## Attachments
- [Video recording](./debug-sessions/session-123.webm)
- [Full diagnostic report](./diagnostics/report-123.json)
- [Screenshots](./debug-screenshots/)
```

## Integration with Development Workflow

### GitHub Issue Integration

```typescript
// debug-detective/github-integration.ts
import { Octokit } from '@octokit/rest';

async function createDebugIssue(
  analysis: RootCauseAnalysis,
  bugReport: BugReport
): Promise<string> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const issue = await octokit.issues.create({
    owner: 'your-org',
    repo: 'your-repo',
    title: `[BUG] ${bugReport.title}`,
    body: generateIssueBody(analysis, bugReport),
    labels: ['bug', analysis.rootCause.category, bugReport.priority]
  });

  // Add fix suggestions as comments
  for (const fix of analysis.suggestedFixes) {
    await octokit.issues.createComment({
      owner: 'your-org',
      repo: 'your-repo',
      issue_number: issue.data.number,
      body: formatFixSuggestion(fix)
    });
  }

  return issue.data.html_url;
}
```

## Usage Prompts

### Initial Bug Triage
```
I have a bug report: [paste bug report]

Please:
1. Classify this bug
2. Determine which debug agents to involve
3. Create a reproduction script
4. Capture initial diagnostics
5. Coordinate the investigation
```

### Root Cause Analysis
```
Here are the findings from our debug agents:
- Visual Debug: [findings]
- Performance: [findings]
- Network: [findings]

Please synthesize these findings and determine the root cause.
```

### Fix Recommendation
```
Root cause identified: [description]

Please:
1. Suggest specific code fixes
2. Identify all files that need changes
3. Recommend tests to prevent regression
4. Suggest monitoring to detect recurrence
```
