# Agent 16: Memory Leak Hunter

## Role
Expert in detecting and resolving memory leaks using Chrome DevTools Protocol, Playwright heap snapshots, and AI-powered analysis to identify memory growth patterns and fix retention issues.

## Core Responsibilities
- Capture and analyze heap snapshots
- Detect memory growth over time
- Identify detached DOM nodes
- Find event listener leaks
- Analyze closure retention
- Profile garbage collection

## Playwright Memory Profiling

### Heap Snapshot Capture

```typescript
// memory-hunter/heap-snapshot.ts
import { Page, CDPSession } from '@playwright/test';
import * as fs from 'fs';

interface HeapSnapshot {
  path: string;
  timestamp: number;
  totalSize: number;
  nodeCount: number;
}

async function captureHeapSnapshot(
  page: Page,
  outputPath: string
): Promise<HeapSnapshot> {
  const client = await page.context().newCDPSession(page);

  // Enable heap profiler
  await client.send('HeapProfiler.enable');

  // Trigger garbage collection first
  await client.send('HeapProfiler.collectGarbage');

  // Capture snapshot
  const chunks: string[] = [];

  client.on('HeapProfiler.addHeapSnapshotChunk', (event) => {
    chunks.push(event.chunk);
  });

  await client.send('HeapProfiler.takeHeapSnapshot', {
    reportProgress: false
  });

  const snapshot = chunks.join('');
  fs.writeFileSync(outputPath, snapshot);

  // Parse for summary stats
  const parsed = JSON.parse(snapshot);
  const stats = calculateSnapshotStats(parsed);

  await client.send('HeapProfiler.disable');

  return {
    path: outputPath,
    timestamp: Date.now(),
    totalSize: stats.totalSize,
    nodeCount: stats.nodeCount
  };
}

function calculateSnapshotStats(snapshot: any): {
  totalSize: number;
  nodeCount: number;
} {
  const nodes = snapshot.nodes || [];
  const nodeFields = snapshot.snapshot?.meta?.node_fields || [];

  const sizeIndex = nodeFields.indexOf('self_size');
  const nodeFieldCount = nodeFields.length;

  let totalSize = 0;
  let nodeCount = 0;

  for (let i = 0; i < nodes.length; i += nodeFieldCount) {
    totalSize += nodes[i + sizeIndex] || 0;
    nodeCount++;
  }

  return { totalSize, nodeCount };
}
```

### Memory Growth Detection

```typescript
// memory-hunter/growth-detector.ts
import { Page } from '@playwright/test';

interface MemoryGrowthResult {
  initial: MemoryMetrics;
  final: MemoryMetrics;
  growth: MemoryGrowth;
  isLeak: boolean;
  suspiciousPatterns: string[];
}

interface MemoryMetrics {
  jsHeapSize: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  timestamp: number;
}

interface MemoryGrowth {
  absolute: number;
  percentage: number;
  rate: number; // bytes per second
}

async function detectMemoryGrowth(
  page: Page,
  action: () => Promise<void>,
  iterations: number = 10
): Promise<MemoryGrowthResult> {
  const measurements: MemoryMetrics[] = [];

  // Initial measurement
  await forceGarbageCollection(page);
  measurements.push(await getMemoryMetrics(page));

  // Perform action multiple times
  for (let i = 0; i < iterations; i++) {
    await action();
    await forceGarbageCollection(page);
    measurements.push(await getMemoryMetrics(page));
  }

  const initial = measurements[0];
  const final = measurements[measurements.length - 1];

  const absoluteGrowth = final.usedJSHeapSize - initial.usedJSHeapSize;
  const timeElapsed = (final.timestamp - initial.timestamp) / 1000;

  const growth: MemoryGrowth = {
    absolute: absoluteGrowth,
    percentage: (absoluteGrowth / initial.usedJSHeapSize) * 100,
    rate: absoluteGrowth / timeElapsed
  };

  // Analyze for leak patterns
  const suspiciousPatterns = analyzeMeasurements(measurements);

  return {
    initial,
    final,
    growth,
    isLeak: growth.percentage > 10 && isConsistentGrowth(measurements),
    suspiciousPatterns
  };
}

async function forceGarbageCollection(page: Page): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send('HeapProfiler.collectGarbage');
}

async function getMemoryMetrics(page: Page): Promise<MemoryMetrics> {
  const metrics = await page.evaluate(() => {
    const memory = (performance as any).memory;
    return {
      jsHeapSize: memory?.jsHeapSizeLimit || 0,
      totalJSHeapSize: memory?.totalJSHeapSize || 0,
      usedJSHeapSize: memory?.usedJSHeapSize || 0
    };
  });

  return {
    ...metrics,
    timestamp: Date.now()
  };
}

function isConsistentGrowth(measurements: MemoryMetrics[]): boolean {
  let growthCount = 0;

  for (let i = 1; i < measurements.length; i++) {
    if (measurements[i].usedJSHeapSize > measurements[i - 1].usedJSHeapSize) {
      growthCount++;
    }
  }

  // If memory grows in more than 70% of iterations, it's likely a leak
  return growthCount / (measurements.length - 1) > 0.7;
}

function analyzeMeasurements(measurements: MemoryMetrics[]): string[] {
  const patterns: string[] = [];

  // Check for consistent growth
  if (isConsistentGrowth(measurements)) {
    patterns.push('Consistent memory growth across iterations');
  }

  // Check for large jumps
  for (let i = 1; i < measurements.length; i++) {
    const jump = measurements[i].usedJSHeapSize - measurements[i - 1].usedJSHeapSize;
    if (jump > 1000000) { // > 1MB
      patterns.push(`Large memory jump of ${(jump / 1024 / 1024).toFixed(2)}MB at iteration ${i}`);
    }
  }

  return patterns;
}
```

### Detached DOM Node Detection

```typescript
// memory-hunter/detached-dom-detector.ts
import { Page, CDPSession } from '@playwright/test';

interface DetachedNode {
  className: string;
  id: string;
  tagName: string;
  retainingPath: string[];
  size: number;
}

async function findDetachedDOMNodes(page: Page): Promise<DetachedNode[]> {
  const client = await page.context().newCDPSession(page);

  await client.send('HeapProfiler.enable');
  await client.send('HeapProfiler.collectGarbage');

  // Take heap snapshot
  const chunks: string[] = [];
  client.on('HeapProfiler.addHeapSnapshotChunk', (event) => {
    chunks.push(event.chunk);
  });

  await client.send('HeapProfiler.takeHeapSnapshot', {
    reportProgress: false
  });

  const snapshot = JSON.parse(chunks.join(''));

  // Parse snapshot to find detached DOM nodes
  const detachedNodes = parseSnapshotForDetachedDOM(snapshot);

  await client.send('HeapProfiler.disable');

  return detachedNodes;
}

function parseSnapshotForDetachedDOM(snapshot: any): DetachedNode[] {
  const detached: DetachedNode[] = [];

  const nodes = snapshot.nodes;
  const strings = snapshot.strings;
  const edges = snapshot.edges;
  const nodeFields = snapshot.snapshot.meta.node_fields;
  const edgeFields = snapshot.snapshot.meta.edge_fields;

  const typeIndex = nodeFields.indexOf('type');
  const nameIndex = nodeFields.indexOf('name');
  const selfSizeIndex = nodeFields.indexOf('self_size');
  const nodeFieldCount = nodeFields.length;

  // Find nodes with "Detached" in their type
  for (let i = 0; i < nodes.length; i += nodeFieldCount) {
    const type = snapshot.snapshot.meta.node_types[0][nodes[i + typeIndex]];
    const name = strings[nodes[i + nameIndex]];

    if (name && name.includes('Detached')) {
      detached.push({
        className: name.replace('Detached ', ''),
        id: '',
        tagName: extractTagName(name),
        retainingPath: [], // Would need to trace edges
        size: nodes[i + selfSizeIndex]
      });
    }
  }

  return detached;
}

function extractTagName(name: string): string {
  const match = name.match(/Detached (\w+)/);
  return match ? match[1] : 'Unknown';
}
```

### Event Listener Leak Detection

```typescript
// memory-hunter/listener-detector.ts
import { Page } from '@playwright/test';

interface ListenerLeak {
  element: string;
  eventType: string;
  listenerCount: number;
  isExcessive: boolean;
}

async function detectListenerLeaks(page: Page): Promise<ListenerLeak[]> {
  const leaks = await page.evaluate(() => {
    const results: ListenerLeak[] = [];

    // Get all elements
    const elements = document.querySelectorAll('*');

    elements.forEach(el => {
      // Use getEventListeners if available (Chrome DevTools)
      const listeners = (window as any).getEventListeners?.(el) || {};

      for (const [eventType, handlers] of Object.entries(listeners)) {
        if ((handlers as any[]).length > 5) {
          results.push({
            element: `${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ')[0] : ''}`,
            eventType,
            listenerCount: (handlers as any[]).length,
            isExcessive: true
          });
        }
      }
    });

    // Also check window and document
    const windowListeners = (window as any).getEventListeners?.(window) || {};
    for (const [eventType, handlers] of Object.entries(windowListeners)) {
      if ((handlers as any[]).length > 3) {
        results.push({
          element: 'window',
          eventType,
          listenerCount: (handlers as any[]).length,
          isExcessive: true
        });
      }
    }

    return results;
  });

  return leaks;
}

async function trackListenerChanges(
  page: Page,
  action: () => Promise<void>
): Promise<{
  before: number;
  after: number;
  diff: number;
}> {
  const before = await countAllListeners(page);
  await action();
  const after = await countAllListeners(page);

  return {
    before,
    after,
    diff: after - before
  };
}

async function countAllListeners(page: Page): Promise<number> {
  return await page.evaluate(() => {
    let count = 0;
    const elements = document.querySelectorAll('*');

    elements.forEach(el => {
      const listeners = (window as any).getEventListeners?.(el) || {};
      for (const handlers of Object.values(listeners)) {
        count += (handlers as any[]).length;
      }
    });

    // Count window listeners
    const windowListeners = (window as any).getEventListeners?.(window) || {};
    for (const handlers of Object.values(windowListeners)) {
      count += (handlers as any[]).length;
    }

    return count;
  });
}
```

### Closure Retention Analysis

```typescript
// memory-hunter/closure-analyzer.ts
import { Page, CDPSession } from '@playwright/test';

interface ClosureLeak {
  functionName: string;
  retainedSize: number;
  retainedVariables: string[];
  location: string;
}

async function analyzeClosureRetention(
  page: Page,
  snapshotPath: string
): Promise<ClosureLeak[]> {
  const snapshot = JSON.parse(
    require('fs').readFileSync(snapshotPath, 'utf-8')
  );

  const closures: ClosureLeak[] = [];

  const nodes = snapshot.nodes;
  const strings = snapshot.strings;
  const edges = snapshot.edges;

  const nodeFields = snapshot.snapshot.meta.node_fields;
  const edgeFields = snapshot.snapshot.meta.edge_fields;

  const nodeTypeIndex = nodeFields.indexOf('type');
  const nodeNameIndex = nodeFields.indexOf('name');
  const nodeSizeIndex = nodeFields.indexOf('retained_size');
  const nodeFieldCount = nodeFields.length;

  // Find closure objects
  for (let i = 0; i < nodes.length; i += nodeFieldCount) {
    const type = snapshot.snapshot.meta.node_types[0][nodes[i + nodeTypeIndex]];

    if (type === 'closure') {
      const name = strings[nodes[i + nodeNameIndex]];
      const retainedSize = nodes[i + nodeSizeIndex];

      // Large closures might indicate leaks
      if (retainedSize > 100000) { // > 100KB
        closures.push({
          functionName: name || 'anonymous',
          retainedSize,
          retainedVariables: [], // Would parse edges
          location: ''
        });
      }
    }
  }

  return closures.sort((a, b) => b.retainedSize - a.retainedSize);
}
```

## Comprehensive Memory Analysis

### Memory Leak Test Suite

```typescript
// memory-hunter/leak-test-suite.ts
import { test, expect } from '@playwright/test';

interface LeakTestResult {
  testName: string;
  passed: boolean;
  memoryGrowth: number;
  detachedNodes: number;
  listenerLeaks: number;
  details: string;
}

async function runLeakTests(page: Page): Promise<LeakTestResult[]> {
  const results: LeakTestResult[] = [];

  // Test 1: Component mount/unmount cycle
  results.push(await testMountUnmountCycle(page));

  // Test 2: Navigation memory
  results.push(await testNavigationMemory(page));

  // Test 3: Modal open/close cycle
  results.push(await testModalCycle(page));

  // Test 4: Infinite scroll
  results.push(await testInfiniteScroll(page));

  // Test 5: Form submission
  results.push(await testFormSubmission(page));

  return results;
}

async function testMountUnmountCycle(page: Page): Promise<LeakTestResult> {
  const initialMemory = await getMemoryMetrics(page);

  // Mount and unmount component 20 times
  for (let i = 0; i < 20; i++) {
    await page.click('[data-testid="toggle-component"]');
    await page.waitForTimeout(100);
    await page.click('[data-testid="toggle-component"]');
    await page.waitForTimeout(100);
  }

  await forceGarbageCollection(page);
  const finalMemory = await getMemoryMetrics(page);

  const growth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
  const growthMB = growth / 1024 / 1024;

  return {
    testName: 'Mount/Unmount Cycle',
    passed: growthMB < 1, // Less than 1MB growth
    memoryGrowth: growth,
    detachedNodes: 0,
    listenerLeaks: 0,
    details: `Memory grew by ${growthMB.toFixed(2)}MB after 20 cycles`
  };
}

async function testNavigationMemory(page: Page): Promise<LeakTestResult> {
  const initialMemory = await getMemoryMetrics(page);

  // Navigate between pages
  const routes = ['/', '/dashboard', '/settings', '/profile'];

  for (let i = 0; i < 5; i++) {
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
    }
  }

  await forceGarbageCollection(page);
  const finalMemory = await getMemoryMetrics(page);

  const growth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;

  return {
    testName: 'Navigation Memory',
    passed: growth < 5 * 1024 * 1024, // Less than 5MB
    memoryGrowth: growth,
    detachedNodes: 0,
    listenerLeaks: 0,
    details: `Memory grew by ${(growth / 1024 / 1024).toFixed(2)}MB after navigating`
  };
}

async function testModalCycle(page: Page): Promise<LeakTestResult> {
  const listenersBefore = await countAllListeners(page);

  // Open and close modal 30 times
  for (let i = 0; i < 30; i++) {
    await page.click('[data-testid="open-modal"]');
    await page.waitForSelector('[data-testid="modal"]');
    await page.click('[data-testid="close-modal"]');
    await page.waitForSelector('[data-testid="modal"]', { state: 'hidden' });
  }

  const listenersAfter = await countAllListeners(page);
  const listenerGrowth = listenersAfter - listenersBefore;

  return {
    testName: 'Modal Open/Close Cycle',
    passed: listenerGrowth < 10,
    memoryGrowth: 0,
    detachedNodes: 0,
    listenerLeaks: listenerGrowth,
    details: `${listenerGrowth} listeners added after 30 cycles`
  };
}

async function testInfiniteScroll(page: Page): Promise<LeakTestResult> {
  await page.goto('/feed');
  const initialMemory = await getMemoryMetrics(page);

  // Scroll to load more content
  for (let i = 0; i < 50; i++) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);
  }

  await forceGarbageCollection(page);
  const finalMemory = await getMemoryMetrics(page);

  const growth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;

  // Check for detached DOM nodes
  const detached = await findDetachedDOMNodes(page);

  return {
    testName: 'Infinite Scroll',
    passed: detached.length < 50 && growth < 20 * 1024 * 1024,
    memoryGrowth: growth,
    detachedNodes: detached.length,
    listenerLeaks: 0,
    details: `${detached.length} detached nodes, ${(growth / 1024 / 1024).toFixed(2)}MB growth`
  };
}
```

## AI-Powered Memory Analysis

### Intelligent Leak Detection

```typescript
// memory-hunter/ai-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';

interface MemoryAnalysis {
  summary: string;
  leaks: LeakDescription[];
  fixes: CodeFix[];
  estimatedImpact: string;
}

interface LeakDescription {
  type: 'dom' | 'closure' | 'listener' | 'timer' | 'cache';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  evidence: string;
}

async function analyzeMemoryLeaks(
  growthResult: MemoryGrowthResult,
  detachedNodes: DetachedNode[],
  listenerLeaks: ListenerLeak[],
  closureLeaks: ClosureLeak[]
): Promise<MemoryAnalysis> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `Analyze these memory leak indicators:

## Memory Growth
- Initial: ${(growthResult.initial.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
- Final: ${(growthResult.final.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
- Growth: ${(growthResult.growth.absolute / 1024 / 1024).toFixed(2)}MB (${growthResult.growth.percentage.toFixed(1)}%)
- Rate: ${(growthResult.growth.rate / 1024).toFixed(2)}KB/s

## Detached DOM Nodes (${detachedNodes.length} found)
${detachedNodes.slice(0, 10).map(n =>
  `- ${n.tagName}.${n.className}: ${(n.size / 1024).toFixed(1)}KB`
).join('\n')}

## Listener Leaks (${listenerLeaks.length} found)
${listenerLeaks.map(l =>
  `- ${l.element}: ${l.eventType} (${l.listenerCount} listeners)`
).join('\n')}

## Large Closures (${closureLeaks.length} found)
${closureLeaks.slice(0, 5).map(c =>
  `- ${c.functionName}: ${(c.retainedSize / 1024).toFixed(1)}KB retained`
).join('\n')}

Provide:
1. Summary of memory health
2. Each leak identified with type, severity, and evidence
3. Specific code fixes for each leak
4. Estimated memory savings if all fixed`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

## Deliverables

### Memory Leak Report Template

```markdown
# Memory Leak Analysis Report

## Executive Summary
**Overall Health:** ⚠️ Warning
**Total Memory Growth:** 15.3MB over 10 iterations
**Leak Probability:** High (87%)

## Memory Timeline

| Iteration | Heap Size | Growth | Detached Nodes |
|-----------|-----------|--------|----------------|
| 0 | 25.0MB | - | 0 |
| 1 | 26.2MB | +1.2MB | 5 |
| 2 | 27.5MB | +1.3MB | 12 |
| ... | ... | ... | ... |
| 10 | 40.3MB | +1.4MB | 150 |

## Identified Leaks

### 1. Detached DOM Nodes (Critical)
**Type:** DOM Leak
**Impact:** 8.5MB retained

Components being removed from DOM but kept in memory:
- `ProductCard` (45 instances, 180KB each)
- `UserAvatar` (30 instances, 50KB each)

**Root Cause:**
Event listeners not cleaned up in useEffect:

```typescript
// Before - Leak
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// After - Fixed
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### 2. Closure Retention (High)
**Type:** Closure Leak
**Impact:** 3.2MB retained

Large data arrays captured in closures:

```typescript
// Before - Leak
const processData = () => {
  const hugeArray = fetchHugeData(); // Captured in closure
  return items.map(item => hugeArray.find(h => h.id === item.id));
};

// After - Fixed
const processData = (hugeArray) => {
  return items.map(item => hugeArray.find(h => h.id === item.id));
};
```

### 3. Event Listener Accumulation (Medium)
**Type:** Listener Leak
**Impact:** 500+ listeners on window

**Location:** `src/hooks/useScroll.ts`

## Recommendations

1. **Immediate:** Add cleanup to all useEffect hooks with event listeners
2. **Short-term:** Implement virtualization for long lists
3. **Long-term:** Add memory leak detection to CI pipeline

## Estimated Savings
- Fix #1: -8.5MB
- Fix #2: -3.2MB
- Fix #3: -1.1MB
- **Total: -12.8MB (84% reduction)**
```

## Usage Prompts

### Memory Leak Investigation
```
Investigate memory leak in the dashboard:
1. Run memory growth detection over 20 iterations
2. Capture heap snapshots before and after
3. Find detached DOM nodes
4. Check for listener leaks
5. Provide specific fixes
```

### Component Memory Audit
```
Audit memory usage of the ProductList component:
1. Measure memory during mount/unmount cycles
2. Check for proper cleanup in useEffect
3. Identify any closure leaks
4. Verify virtualization is working
```

### Memory Optimization
```
Optimize memory usage for infinite scroll:
1. Analyze current memory growth pattern
2. Find detached nodes from scrolled-away items
3. Suggest virtualization implementation
4. Provide before/after comparison
```
