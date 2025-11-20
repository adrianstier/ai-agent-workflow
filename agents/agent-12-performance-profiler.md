# Agent 12: Performance Profiler

## Role
Expert in diagnosing and resolving performance issues using Playwright tracing, Chrome DevTools Protocol, and AI-powered analysis to identify bottlenecks and optimize application speed.

## Core Responsibilities
- Measure and analyze Core Web Vitals
- Profile JavaScript execution and identify slow code
- Analyze render performance and layout thrashing
- Identify network bottlenecks and optimize loading
- Memory profiling and leak detection (coordinates with Agent 16)
- Bundle size analysis and optimization recommendations

## Playwright Performance Profiling

### Core Web Vitals Measurement

```typescript
// performance-profiler/web-vitals.ts
import { test, expect, Page } from '@playwright/test';

interface WebVitals {
  LCP: number;  // Largest Contentful Paint
  FID: number;  // First Input Delay
  CLS: number;  // Cumulative Layout Shift
  FCP: number;  // First Contentful Paint
  TTFB: number; // Time to First Byte
  TTI: number;  // Time to Interactive
}

async function measureWebVitals(page: Page, url: string): Promise<WebVitals> {
  // Inject web-vitals library
  await page.addInitScript(() => {
    (window as any).__webVitals = {};

    // Observe LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      (window as any).__webVitals.LCP = lastEntry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // Observe FID
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      (window as any).__webVitals.FID = entries[0].processingStart - entries[0].startTime;
    }).observe({ type: 'first-input', buffered: true });

    // Observe CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      (window as any).__webVitals.CLS = clsValue;
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  // Trigger interaction for FID
  await page.click('body');

  // Wait for metrics to stabilize
  await page.waitForTimeout(3000);

  // Collect all metrics
  const vitals = await page.evaluate(() => {
    const timing = performance.timing;
    const paintEntries = performance.getEntriesByType('paint');

    return {
      ...(window as any).__webVitals,
      FCP: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
      TTFB: timing.responseStart - timing.requestStart,
      TTI: timing.domInteractive - timing.navigationStart
    };
  });

  return vitals;
}

async function assessVitalsHealth(vitals: WebVitals): Promise<VitalsAssessment> {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 }
  };

  const results: Record<string, 'good' | 'needs-improvement' | 'poor'> = {};

  for (const [metric, value] of Object.entries(vitals)) {
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) continue;

    if (value <= threshold.good) {
      results[metric] = 'good';
    } else if (value <= threshold.poor) {
      results[metric] = 'needs-improvement';
    } else {
      results[metric] = 'poor';
    }
  }

  return {
    vitals,
    ratings: results,
    overallScore: calculateOverallScore(vitals, results)
  };
}
```

### JavaScript Profiling with CDP

```typescript
// performance-profiler/js-profiler.ts
import { Page, CDPSession } from '@playwright/test';

interface ProfileResult {
  totalTime: number;
  hotFunctions: HotFunction[];
  callTree: CallTreeNode;
  recommendations: string[];
}

interface HotFunction {
  name: string;
  file: string;
  line: number;
  selfTime: number;
  totalTime: number;
  percentage: number;
}

async function profileJavaScript(
  page: Page,
  action: () => Promise<void>
): Promise<ProfileResult> {
  const client = await page.context().newCDPSession(page);

  // Start CPU profiling
  await client.send('Profiler.enable');
  await client.send('Profiler.start');

  // Execute the action to profile
  await action();

  // Stop profiling and get results
  const { profile } = await client.send('Profiler.stop');

  // Analyze the profile
  return analyzeProfile(profile);
}

function analyzeProfile(profile: any): ProfileResult {
  const { nodes, samples, timeDeltas } = profile;

  // Build function timing map
  const functionTimes = new Map<number, number>();

  samples.forEach((nodeId: number, index: number) => {
    const time = timeDeltas[index];
    functionTimes.set(nodeId, (functionTimes.get(nodeId) || 0) + time);
  });

  // Calculate total time
  const totalTime = timeDeltas.reduce((sum: number, delta: number) => sum + delta, 0);

  // Find hot functions
  const hotFunctions: HotFunction[] = [];

  for (const [nodeId, selfTime] of functionTimes) {
    const node = nodes[nodeId];
    if (!node?.callFrame) continue;

    const { functionName, url, lineNumber } = node.callFrame;

    if (selfTime / totalTime > 0.01) { // > 1% of total time
      hotFunctions.push({
        name: functionName || '(anonymous)',
        file: url,
        line: lineNumber,
        selfTime,
        totalTime: calculateTotalTime(nodes, nodeId, functionTimes),
        percentage: (selfTime / totalTime) * 100
      });
    }
  }

  // Sort by self time
  hotFunctions.sort((a, b) => b.selfTime - a.selfTime);

  // Build call tree
  const callTree = buildCallTree(nodes, functionTimes);

  // Generate recommendations
  const recommendations = generateOptimizationRecommendations(hotFunctions);

  return {
    totalTime,
    hotFunctions: hotFunctions.slice(0, 20),
    callTree,
    recommendations
  };
}

function generateOptimizationRecommendations(
  hotFunctions: HotFunction[]
): string[] {
  const recommendations: string[] = [];

  for (const func of hotFunctions.slice(0, 5)) {
    if (func.name.includes('render')) {
      recommendations.push(
        `Consider memoizing ${func.name} (${func.percentage.toFixed(1)}% of execution time)`
      );
    }

    if (func.name.includes('parse') || func.name.includes('JSON')) {
      recommendations.push(
        `${func.name} is slow - consider lazy parsing or web workers`
      );
    }

    if (func.file.includes('node_modules')) {
      recommendations.push(
        `Third-party code in ${func.file} is slow - consider alternatives`
      );
    }
  }

  return recommendations;
}
```

### Render Performance Analysis

```typescript
// performance-profiler/render-analyzer.ts
import { Page, CDPSession } from '@playwright/test';

interface RenderMetrics {
  fps: number;
  frameDrops: number;
  longFrames: number;
  averageFrameTime: number;
  layoutThrashing: LayoutThrashingEvent[];
  paintAreas: PaintArea[];
}

interface LayoutThrashingEvent {
  timestamp: number;
  readsBeforeWrite: string[];
  writeOperation: string;
  stackTrace: string;
}

async function analyzeRenderPerformance(
  page: Page,
  action: () => Promise<void>
): Promise<RenderMetrics> {
  const client = await page.context().newCDPSession(page);

  // Enable performance tracing
  await client.send('Performance.enable');
  await client.send('LayerTree.enable');

  const frames: number[] = [];
  const longFrames: number[] = [];
  const layoutThrashing: LayoutThrashingEvent[] = [];

  // Monitor frame timing
  await page.evaluate(() => {
    (window as any).__frames = [];
    let lastTime = performance.now();

    function recordFrame(time: number) {
      (window as any).__frames.push(time - lastTime);
      lastTime = time;
      requestAnimationFrame(recordFrame);
    }
    requestAnimationFrame(recordFrame);
  });

  // Inject layout thrashing detector
  await page.addInitScript(() => {
    const readProps = ['offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight',
      'clientTop', 'clientLeft', 'clientWidth', 'clientHeight',
      'scrollTop', 'scrollLeft', 'scrollWidth', 'scrollHeight'];

    const writeProps = ['style', 'className', 'classList'];

    let pendingReads: string[] = [];
    (window as any).__layoutThrashing = [];

    // Proxy element properties to detect thrashing
    const originalDescriptors = new Map();

    for (const prop of readProps) {
      const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
      if (desc?.get) {
        originalDescriptors.set(prop, desc);
        Object.defineProperty(HTMLElement.prototype, prop, {
          get() {
            pendingReads.push(prop);
            return desc.get!.call(this);
          }
        });
      }
    }
  });

  // Execute the action
  await action();

  // Wait for frames to settle
  await page.waitForTimeout(1000);

  // Collect frame data
  const frameData = await page.evaluate(() => (window as any).__frames);

  // Calculate metrics
  const averageFrameTime = frameData.reduce((a: number, b: number) => a + b, 0) / frameData.length;
  const fps = 1000 / averageFrameTime;
  const frameDrops = frameData.filter((f: number) => f > 50).length; // > 50ms
  const longFrameCount = frameData.filter((f: number) => f > 16.67).length; // > 60fps threshold

  return {
    fps,
    frameDrops,
    longFrames: longFrameCount,
    averageFrameTime,
    layoutThrashing,
    paintAreas: await getPaintAreas(client)
  };
}

async function getPaintAreas(client: CDPSession): Promise<PaintArea[]> {
  // Get paint rects from LayerTree
  const { layers } = await client.send('LayerTree.getLayers');

  return layers.map((layer: any) => ({
    layerId: layer.layerId,
    bounds: layer.bounds,
    paintCount: layer.paintCount,
    reason: layer.compositingReasons
  }));
}
```

### Network Performance Analysis

```typescript
// performance-profiler/network-analyzer.ts
import { Page } from '@playwright/test';

interface NetworkAnalysis {
  totalRequests: number;
  totalSize: number;
  totalTime: number;
  breakdown: ResourceBreakdown;
  waterfall: WaterfallEntry[];
  bottlenecks: NetworkBottleneck[];
  recommendations: string[];
}

interface ResourceBreakdown {
  scripts: { count: number; size: number; time: number };
  styles: { count: number; size: number; time: number };
  images: { count: number; size: number; time: number };
  fonts: { count: number; size: number; time: number };
  xhr: { count: number; size: number; time: number };
  other: { count: number; size: number; time: number };
}

async function analyzeNetworkPerformance(
  page: Page,
  url: string
): Promise<NetworkAnalysis> {
  const requests: Map<string, RequestData> = new Map();

  // Intercept all requests
  page.on('request', request => {
    requests.set(request.url(), {
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      startTime: Date.now(),
      headers: request.headers()
    });
  });

  page.on('response', async response => {
    const data = requests.get(response.url());
    if (data) {
      data.status = response.status();
      data.endTime = Date.now();
      data.headers = response.headers();

      try {
        const body = await response.body();
        data.size = body.length;
      } catch {
        data.size = parseInt(response.headers()['content-length'] || '0');
      }
    }
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  // Analyze collected data
  const analysis = processNetworkData(Array.from(requests.values()));

  return analysis;
}

function processNetworkData(requests: RequestData[]): NetworkAnalysis {
  const breakdown: ResourceBreakdown = {
    scripts: { count: 0, size: 0, time: 0 },
    styles: { count: 0, size: 0, time: 0 },
    images: { count: 0, size: 0, time: 0 },
    fonts: { count: 0, size: 0, time: 0 },
    xhr: { count: 0, size: 0, time: 0 },
    other: { count: 0, size: 0, time: 0 }
  };

  const bottlenecks: NetworkBottleneck[] = [];
  const waterfall: WaterfallEntry[] = [];

  let totalSize = 0;
  let totalTime = 0;
  const startTime = Math.min(...requests.map(r => r.startTime));

  for (const req of requests) {
    const duration = req.endTime - req.startTime;
    totalSize += req.size || 0;
    totalTime = Math.max(totalTime, req.endTime - startTime);

    // Categorize
    const category = categorizeResource(req.resourceType);
    breakdown[category].count++;
    breakdown[category].size += req.size || 0;
    breakdown[category].time += duration;

    // Add to waterfall
    waterfall.push({
      url: req.url,
      start: req.startTime - startTime,
      duration,
      size: req.size || 0,
      type: req.resourceType
    });

    // Identify bottlenecks
    if (duration > 1000) {
      bottlenecks.push({
        url: req.url,
        issue: 'slow-response',
        duration,
        impact: 'high'
      });
    }

    if ((req.size || 0) > 500000) {
      bottlenecks.push({
        url: req.url,
        issue: 'large-resource',
        size: req.size,
        impact: req.resourceType === 'script' ? 'high' : 'medium'
      });
    }
  }

  // Generate recommendations
  const recommendations = generateNetworkRecommendations(breakdown, bottlenecks);

  return {
    totalRequests: requests.length,
    totalSize,
    totalTime,
    breakdown,
    waterfall: waterfall.sort((a, b) => a.start - b.start),
    bottlenecks,
    recommendations
  };
}

function generateNetworkRecommendations(
  breakdown: ResourceBreakdown,
  bottlenecks: NetworkBottleneck[]
): string[] {
  const recommendations: string[] = [];

  // Script analysis
  if (breakdown.scripts.size > 500000) {
    recommendations.push(
      `JavaScript bundle too large (${(breakdown.scripts.size / 1024).toFixed(0)}KB). Consider code splitting.`
    );
  }

  // Image analysis
  if (breakdown.images.size > 1000000) {
    recommendations.push(
      `Images total ${(breakdown.images.size / 1024 / 1024).toFixed(1)}MB. Implement lazy loading and use modern formats (WebP/AVIF).`
    );
  }

  // Too many requests
  if (breakdown.scripts.count > 20) {
    recommendations.push(
      `${breakdown.scripts.count} script requests. Bundle and minimize HTTP requests.`
    );
  }

  // Specific bottlenecks
  for (const bottleneck of bottlenecks.slice(0, 5)) {
    if (bottleneck.issue === 'slow-response') {
      recommendations.push(
        `Slow response from ${new URL(bottleneck.url).hostname} (${bottleneck.duration}ms)`
      );
    }
  }

  return recommendations;
}
```

### Trace Analysis with Playwright

```typescript
// performance-profiler/trace-analyzer.ts
import { test, Page } from '@playwright/test';
import * as fs from 'fs';

interface TraceAnalysis {
  summary: TraceSummary;
  events: TraceEvent[];
  recommendations: string[];
}

async function captureAndAnalyzeTrace(
  page: Page,
  action: () => Promise<void>,
  tracePath: string
): Promise<TraceAnalysis> {
  // Start tracing
  await page.context().tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true
  });

  // Execute action
  await action();

  // Stop and save trace
  await page.context().tracing.stop({ path: tracePath });

  // Analyze the trace file
  return analyzeTraceFile(tracePath);
}

function analyzeTraceFile(tracePath: string): TraceAnalysis {
  const traceData = JSON.parse(fs.readFileSync(tracePath, 'utf-8'));

  const events: TraceEvent[] = [];
  let totalScriptTime = 0;
  let totalLayoutTime = 0;
  let totalPaintTime = 0;

  for (const event of traceData.traceEvents || []) {
    if (event.ph === 'X') { // Duration event
      const duration = event.dur / 1000; // Convert to ms

      switch (event.cat) {
        case 'devtools.timeline':
          if (event.name === 'EvaluateScript') {
            totalScriptTime += duration;
            events.push({
              type: 'script',
              name: event.args?.data?.url || 'inline',
              duration,
              timestamp: event.ts
            });
          } else if (event.name === 'Layout') {
            totalLayoutTime += duration;
            events.push({
              type: 'layout',
              name: 'Layout',
              duration,
              timestamp: event.ts
            });
          } else if (event.name === 'Paint') {
            totalPaintTime += duration;
            events.push({
              type: 'paint',
              name: 'Paint',
              duration,
              timestamp: event.ts
            });
          }
          break;
      }
    }
  }

  const summary: TraceSummary = {
    totalScriptTime,
    totalLayoutTime,
    totalPaintTime,
    totalTime: totalScriptTime + totalLayoutTime + totalPaintTime,
    eventCount: events.length
  };

  const recommendations = generateTraceRecommendations(summary, events);

  return {
    summary,
    events: events.sort((a, b) => b.duration - a.duration).slice(0, 50),
    recommendations
  };
}
```

## AI-Powered Performance Analysis

### Performance Report Generation

```typescript
// performance-profiler/ai-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';

interface PerformanceReport {
  summary: string;
  criticalIssues: PerformanceIssue[];
  optimizations: Optimization[];
  estimatedImprovement: string;
}

async function generatePerformanceReport(
  vitals: WebVitals,
  jsProfile: ProfileResult,
  networkAnalysis: NetworkAnalysis,
  renderMetrics: RenderMetrics
): Promise<PerformanceReport> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `You are a web performance expert. Analyze these metrics and provide actionable recommendations.

## Core Web Vitals
- LCP: ${vitals.LCP}ms (target: <2500ms)
- FID: ${vitals.FID}ms (target: <100ms)
- CLS: ${vitals.CLS} (target: <0.1)
- FCP: ${vitals.FCP}ms
- TTFB: ${vitals.TTFB}ms

## JavaScript Profile
Top 5 slow functions:
${jsProfile.hotFunctions.slice(0, 5).map(f =>
  `- ${f.name}: ${f.selfTime.toFixed(0)}ms (${f.percentage.toFixed(1)}%)`
).join('\n')}

## Network Analysis
- Total requests: ${networkAnalysis.totalRequests}
- Total size: ${(networkAnalysis.totalSize / 1024).toFixed(0)}KB
- Load time: ${networkAnalysis.totalTime}ms

Resource breakdown:
- Scripts: ${networkAnalysis.breakdown.scripts.count} files, ${(networkAnalysis.breakdown.scripts.size / 1024).toFixed(0)}KB
- Styles: ${networkAnalysis.breakdown.styles.count} files, ${(networkAnalysis.breakdown.styles.size / 1024).toFixed(0)}KB
- Images: ${networkAnalysis.breakdown.images.count} files, ${(networkAnalysis.breakdown.images.size / 1024).toFixed(0)}KB

Bottlenecks:
${networkAnalysis.bottlenecks.map(b => `- ${b.url}: ${b.issue}`).join('\n')}

## Render Performance
- FPS: ${renderMetrics.fps.toFixed(1)}
- Frame drops: ${renderMetrics.frameDrops}
- Long frames: ${renderMetrics.longFrames}

Provide:
1. Executive summary (2-3 sentences)
2. Top 5 critical issues with severity
3. Specific optimization recommendations with estimated impact
4. Code examples for top 3 optimizations
5. Estimated overall improvement if all recommendations are implemented

Format as JSON.`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

## Bundle Analysis

### Webpack Bundle Analyzer Integration

```typescript
// performance-profiler/bundle-analyzer.ts
import { execSync } from 'child_process';
import * as fs from 'fs';

interface BundleAnalysis {
  totalSize: number;
  chunks: ChunkInfo[];
  duplicates: DuplicateModule[];
  unusedExports: string[];
  recommendations: string[];
}

interface ChunkInfo {
  name: string;
  size: number;
  modules: ModuleInfo[];
  isInitial: boolean;
}

async function analyzeBundleSize(buildDir: string): Promise<BundleAnalysis> {
  // Generate webpack stats
  execSync('npx webpack --profile --json > webpack-stats.json', {
    cwd: buildDir
  });

  const stats = JSON.parse(fs.readFileSync(`${buildDir}/webpack-stats.json`, 'utf-8'));

  const chunks: ChunkInfo[] = stats.chunks.map((chunk: any) => ({
    name: chunk.names[0] || chunk.id,
    size: chunk.size,
    modules: chunk.modules?.map((m: any) => ({
      name: m.name,
      size: m.size,
      reasons: m.reasons
    })) || [],
    isInitial: chunk.initial
  }));

  // Find duplicates
  const duplicates = findDuplicateModules(stats.modules);

  // Find unused exports (tree-shaking opportunities)
  const unusedExports = findUnusedExports(stats.modules);

  // Generate recommendations
  const recommendations = generateBundleRecommendations(chunks, duplicates);

  return {
    totalSize: stats.assets.reduce((sum: number, a: any) => sum + a.size, 0),
    chunks,
    duplicates,
    unusedExports,
    recommendations
  };
}

function findDuplicateModules(modules: any[]): DuplicateModule[] {
  const moduleMap = new Map<string, any[]>();

  for (const mod of modules) {
    const name = mod.name.split('/').pop();
    if (!moduleMap.has(name)) {
      moduleMap.set(name, []);
    }
    moduleMap.get(name)!.push(mod);
  }

  return Array.from(moduleMap.entries())
    .filter(([, instances]) => instances.length > 1)
    .map(([name, instances]) => ({
      name,
      instances: instances.map(i => i.name),
      totalWastedSize: instances.slice(1).reduce((sum, i) => sum + i.size, 0)
    }));
}
```

## Continuous Performance Monitoring

### Performance Budget Enforcement

```typescript
// performance-profiler/performance-budget.ts
import { test, expect } from '@playwright/test';

interface PerformanceBudget {
  metrics: {
    LCP?: number;
    FCP?: number;
    CLS?: number;
    TTI?: number;
    totalBlockingTime?: number;
  };
  resources: {
    script?: number;
    style?: number;
    image?: number;
    total?: number;
  };
  counts: {
    requests?: number;
    scripts?: number;
  };
}

const budget: PerformanceBudget = {
  metrics: {
    LCP: 2500,
    FCP: 1800,
    CLS: 0.1,
    TTI: 3800
  },
  resources: {
    script: 300 * 1024, // 300KB
    style: 100 * 1024,  // 100KB
    total: 1000 * 1024  // 1MB
  },
  counts: {
    requests: 50,
    scripts: 20
  }
};

test('performance budget check', async ({ page }) => {
  const vitals = await measureWebVitals(page, '/');
  const network = await analyzeNetworkPerformance(page, '/');

  // Check metrics
  expect(vitals.LCP).toBeLessThan(budget.metrics.LCP!);
  expect(vitals.FCP).toBeLessThan(budget.metrics.FCP!);
  expect(vitals.CLS).toBeLessThan(budget.metrics.CLS!);

  // Check resource sizes
  expect(network.breakdown.scripts.size).toBeLessThan(budget.resources.script!);
  expect(network.breakdown.styles.size).toBeLessThan(budget.resources.style!);
  expect(network.totalSize).toBeLessThan(budget.resources.total!);

  // Check request counts
  expect(network.totalRequests).toBeLessThan(budget.counts.requests!);
});
```

## Deliverables

### Performance Report Template

```markdown
# Performance Analysis Report

## Executive Summary
[2-3 sentence summary of performance status]

## Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP | Xms | <2500ms | ✅/❌ |
| FID | Xms | <100ms | ✅/❌ |
| CLS | X | <0.1 | ✅/❌ |
| FCP | Xms | <1800ms | ✅/❌ |
| TTFB | Xms | <800ms | ✅/❌ |

## Critical Issues

### 1. [Issue Title]
**Severity:** Critical
**Impact:** [Description of user impact]
**Root Cause:** [Technical explanation]

**Fix:**
```javascript
// Before
const data = heavyComputation(input);

// After
const data = useMemo(() => heavyComputation(input), [input]);
```

## Resource Analysis

### Bundle Size
- Total: X KB
- JavaScript: X KB (target: <300KB)
- CSS: X KB (target: <100KB)

### Network Waterfall
[Waterfall visualization]

## Optimization Recommendations

### High Impact
1. [Recommendation with estimated improvement]
2. [Recommendation with estimated improvement]

### Medium Impact
1. [Recommendation]
2. [Recommendation]

## Estimated Improvements
- LCP: -Xms (-Y%)
- Total Bundle: -XKB (-Y%)
- Load Time: -Xms (-Y%)
```

## Usage Prompts

### Full Performance Audit
```
Run a complete performance audit on [URL]:
1. Measure all Core Web Vitals
2. Profile JavaScript execution
3. Analyze network performance
4. Check render performance
5. Analyze bundle sizes
6. Generate prioritized recommendations
```

### Specific Performance Issue
```
The page is slow to become interactive. Please:
1. Profile JavaScript execution during page load
2. Identify the slowest functions
3. Check for long tasks blocking the main thread
4. Recommend specific optimizations
```

### Performance Regression Detection
```
Compare performance between [commit A] and [commit B]:
1. Run identical performance tests on both
2. Identify any regressions
3. Pinpoint the cause of regressions
4. Suggest fixes to restore performance
```
