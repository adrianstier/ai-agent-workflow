# Debug Agents Suite

A comprehensive set of AI-powered debugging agents that leverage Microsoft Playwright, Chrome DevTools Protocol, and AI image analysis to systematically identify and fix issues in your application.

## Overview

The Debug Agents (10-16) work together as a coordinated debugging system:

```
                    ┌─────────────────────┐
                    │  Agent 10: Debug    │
                    │    Detective        │
                    │   (Orchestrator)    │
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Agent 11:     │   │ Agent 12:       │   │ Agent 13:       │
│ Visual Debug  │   │ Performance     │   │ Network         │
│ Specialist    │   │ Profiler        │   │ Inspector       │
└───────────────┘   └─────────────────┘   └─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Agent 14:     │   │ Agent 15:       │   │ Agent 16:       │
│ State         │   │ Error           │   │ Memory Leak     │
│ Debugger      │   │ Tracker         │   │ Hunter          │
└───────────────┘   └─────────────────┘   └─────────────────┘
```

## Agent Capabilities

### Agent 10: Debug Detective
**Role:** Core orchestrator for debugging workflows

- Triages and classifies bugs by type
- Coordinates multi-agent investigations
- Synthesizes findings from all specialists
- Generates comprehensive debug reports

**Key Features:**
- AI-powered bug classification
- Automated reproduction script generation
- Root cause analysis coordination
- GitHub issue integration

### Agent 11: Visual Debug Specialist
**Role:** Visual regression and UI debugging

- Screenshot comparison with pixel-level diff
- Cross-browser visual testing
- Responsive design debugging
- Animation and transition analysis

**Key Tools:**
- Playwright screenshot API
- Pixelmatch for diff generation
- Claude Vision for AI analysis
- Design-to-implementation comparison

### Agent 12: Performance Profiler
**Role:** Performance optimization and profiling

- Core Web Vitals measurement
- JavaScript CPU profiling
- Render performance analysis
- Bundle size optimization

**Key Tools:**
- Chrome DevTools Protocol
- Lighthouse integration
- Webpack bundle analyzer
- Performance budget enforcement

### Agent 13: Network Inspector
**Role:** API and network debugging

- Request/response interception
- API error analysis
- GraphQL query debugging
- Network mocking for tests

**Key Tools:**
- Playwright route interception
- HAR file export/import
- Request timing analysis
- CORS debugging

### Agent 14: State Debugger
**Role:** State management debugging

- Redux/Zustand state monitoring
- React component inspection
- Stale closure detection
- Context provider analysis

**Key Tools:**
- Redux DevTools integration
- React fiber inspection
- State snapshot testing
- Time travel debugging

### Agent 15: Error Tracker
**Role:** Error capture and analysis

- Runtime error collection
- Source map resolution
- Error pattern detection
- Stack trace analysis

**Key Tools:**
- Console error interception
- Source map consumer
- AI-powered error analysis
- Error trend monitoring

### Agent 16: Memory Leak Hunter
**Role:** Memory profiling and leak detection

- Heap snapshot capture
- Memory growth detection
- Detached DOM node finding
- Event listener leak detection

**Key Tools:**
- Chrome HeapProfiler
- Garbage collection forcing
- Closure retention analysis
- Memory timeline tracking

## Quick Start

### 1. Install Dependencies

```bash
npm install playwright @playwright/test pixelmatch pngjs source-map @anthropic-ai/sdk
```

### 2. Configure Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { channel: 'chrome' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ]
});
```

### 3. Set Up Environment

```bash
# .env
ANTHROPIC_API_KEY=your-api-key
```

## Usage Examples

### Full Debug Investigation

```typescript
import { DebugDetective } from './agents/debug-detective';

const detective = new DebugDetective();

const report = await detective.investigate({
  title: 'Dashboard crashes when loading large datasets',
  description: 'The dashboard becomes unresponsive when more than 1000 items are loaded',
  steps: [
    'Log in to the application',
    'Navigate to dashboard',
    'Click "Load All Data"',
    'Page becomes unresponsive'
  ],
  expected: 'Data loads with pagination',
  actual: 'Browser tab crashes'
});

console.log(report.rootCause);
console.log(report.suggestedFixes);
```

### Visual Regression Testing

```typescript
import { VisualDebugSpecialist } from './agents/visual-debug';

const visual = new VisualDebugSpecialist();

// Compare current with baseline
const diff = await visual.compareScreenshots({
  url: '/dashboard',
  viewports: ['mobile', 'tablet', 'desktop'],
  threshold: 0.1
});

if (diff.matchPercentage < 99) {
  console.log('Visual regression detected!');
  console.log(diff.hotspots);
}
```

### Performance Audit

```typescript
import { PerformanceProfiler } from './agents/performance';

const profiler = new PerformanceProfiler();

const audit = await profiler.fullAudit('/');

console.log('Core Web Vitals:');
console.log(`  LCP: ${audit.vitals.LCP}ms`);
console.log(`  FID: ${audit.vitals.FID}ms`);
console.log(`  CLS: ${audit.vitals.CLS}`);

console.log('\nRecommendations:');
audit.recommendations.forEach(rec => console.log(`  - ${rec}`));
```

### Memory Leak Detection

```typescript
import { MemoryLeakHunter } from './agents/memory';

const hunter = new MemoryLeakHunter();

const result = await hunter.detectGrowth({
  action: async (page) => {
    await page.click('[data-testid="open-modal"]');
    await page.click('[data-testid="close-modal"]');
  },
  iterations: 20
});

if (result.isLeak) {
  console.log(`Memory leak detected! Growth: ${result.growth.percentage}%`);
  console.log(result.suspiciousPatterns);
}
```

## Integration Patterns

### CI/CD Pipeline Integration

```yaml
# .github/workflows/debug.yml
name: Debug Tests

on: [push, pull_request]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:visual
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-diff
          path: debug-diffs/

  performance-budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:performance
      - uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-reports/

  memory-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:memory
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run test:visual -- --only-changed
npm run test:memory -- --quick
```

## Common Debugging Workflows

### 1. Bug Triage Workflow

```
User reports bug → Agent 10 classifies
                 → Routes to specialist agents
                 → Agents investigate in parallel
                 → Agent 10 synthesizes findings
                 → Generates fix recommendations
```

### 2. Performance Regression Workflow

```
CI detects slowdown → Agent 12 profiles
                    → Identifies bottleneck
                    → Agent 10 coordinates
                    → Agent 16 checks memory
                    → Combined optimization plan
```

### 3. Visual Bug Workflow

```
UI looks wrong → Agent 11 captures screenshot
              → Compares with design
              → AI analyzes differences
              → Generates CSS fixes
              → Creates regression test
```

## Best Practices

### 1. Use Agents Proactively

Don't wait for bugs—run agents in CI to catch issues early:

```typescript
// Run after each PR
await detective.runHealthCheck({
  visual: true,
  performance: true,
  memory: true,
  errors: true
});
```

### 2. Maintain Baselines

Keep visual and performance baselines updated:

```bash
# Update baselines after intentional changes
npm run update-baselines
```

### 3. Set Budgets

Define performance and memory budgets:

```typescript
const budgets = {
  performance: {
    LCP: 2500,
    FID: 100,
    CLS: 0.1
  },
  memory: {
    maxGrowth: 5 * 1024 * 1024, // 5MB
    maxDetachedNodes: 50
  }
};
```

### 4. Document Findings

Use agent-generated reports for documentation:

```typescript
const report = await detective.investigate(bug);
await octokit.issues.create({
  title: `[BUG] ${bug.title}`,
  body: report.toMarkdown()
});
```

## Troubleshooting

### Common Issues

1. **Heap snapshots are too large**
   - Use sampling instead of full snapshots
   - Filter by retained size threshold

2. **Visual diffs are noisy**
   - Increase threshold (0.1 → 0.15)
   - Mask dynamic content (timestamps, avatars)

3. **Performance tests are flaky**
   - Run multiple iterations and average
   - Use `networkidle` wait condition
   - Disable animations during tests

4. **Memory tests show false positives**
   - Force GC before measurements
   - Allow stabilization time
   - Use consistent test data

## Contributing

When adding new debugging capabilities:

1. Follow the existing agent structure
2. Include AI-powered analysis where applicable
3. Generate actionable recommendations
4. Create deliverable report templates
5. Add usage prompts for common scenarios

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Claude Vision API](https://docs.anthropic.com/en/docs/vision)
- [Web Vitals](https://web.dev/vitals/)
