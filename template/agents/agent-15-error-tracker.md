# Agent 15: Error Tracker

## Role
Expert in tracking, analyzing, and resolving JavaScript errors using Playwright's error capturing, source map analysis, and AI-powered stack trace interpretation.

## Core Responsibilities
- Capture and categorize runtime errors
- Analyze stack traces with source maps
- Identify error patterns and root causes
- Track error frequency and impact
- Correlate errors with user actions
- Generate actionable fix recommendations

## Playwright Error Capturing

### Comprehensive Error Collection

```typescript
// error-tracker/error-collector.ts
import { Page, ConsoleMessage } from '@playwright/test';

interface ErrorLog {
  errors: CapturedError[];
  warnings: CapturedWarning[];
  uncaughtExceptions: UncaughtException[];
  unhandledRejections: UnhandledRejection[];
  summary: ErrorSummary;
}

interface CapturedError {
  id: string;
  type: 'error' | 'exception' | 'rejection';
  message: string;
  stack: string;
  source: {
    file: string;
    line: number;
    column: number;
  };
  timestamp: number;
  context: {
    url: string;
    userAction?: string;
    componentStack?: string;
  };
  metadata: Record<string, any>;
}

interface ErrorSummary {
  totalErrors: number;
  uniqueErrors: number;
  errorsByType: Record<string, number>;
  errorsByFile: Record<string, number>;
  criticalErrors: number;
}

async function setupErrorTracking(page: Page): Promise<ErrorLog> {
  const errorLog: ErrorLog = {
    errors: [],
    warnings: [],
    uncaughtExceptions: [],
    unhandledRejections: [],
    summary: {
      totalErrors: 0,
      uniqueErrors: 0,
      errorsByType: {},
      errorsByFile: {},
      criticalErrors: 0
    }
  };

  // Track console errors
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error') {
      const error = createErrorFromConsole(message);
      errorLog.errors.push(error);
      updateSummary(errorLog.summary, error);
    } else if (message.type() === 'warning') {
      errorLog.warnings.push({
        message: message.text(),
        location: message.location(),
        timestamp: Date.now()
      });
    }
  });

  // Track page errors (uncaught exceptions)
  page.on('pageerror', (error: Error) => {
    const captured = createErrorFromException(error);
    errorLog.uncaughtExceptions.push(captured);
    errorLog.errors.push(captured);
    updateSummary(errorLog.summary, captured);
  });

  // Inject unhandled rejection tracking
  await page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (event) => {
      (window as any).__UNHANDLED_REJECTIONS__ =
        (window as any).__UNHANDLED_REJECTIONS__ || [];

      (window as any).__UNHANDLED_REJECTIONS__.push({
        reason: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || '',
        timestamp: Date.now()
      });
    });
  });

  // Inject React error boundary tracking
  await page.addInitScript(() => {
    (window as any).__REACT_ERRORS__ = [];

    // Patch React's error handling
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('React')) {
        (window as any).__REACT_ERRORS__.push({
          message: args.map(String).join(' '),
          timestamp: Date.now()
        });
      }
      originalError.apply(console, args);
    };
  });

  return errorLog;
}

function createErrorFromConsole(message: ConsoleMessage): CapturedError {
  const location = message.location();

  return {
    id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'error',
    message: message.text(),
    stack: message.text(),
    source: {
      file: location.url,
      line: location.lineNumber,
      column: location.columnNumber
    },
    timestamp: Date.now(),
    context: {
      url: ''
    },
    metadata: {}
  };
}

function createErrorFromException(error: Error): CapturedError {
  const stackLines = error.stack?.split('\n') || [];
  const sourceLine = stackLines[1] || '';
  const match = sourceLine.match(/(?:at\s+)?(.+?):(\d+):(\d+)/);

  return {
    id: `exc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'exception',
    message: error.message,
    stack: error.stack || '',
    source: {
      file: match?.[1] || 'unknown',
      line: parseInt(match?.[2] || '0'),
      column: parseInt(match?.[3] || '0')
    },
    timestamp: Date.now(),
    context: {
      url: ''
    },
    metadata: {
      name: error.name
    }
  };
}

function updateSummary(summary: ErrorSummary, error: CapturedError): void {
  summary.totalErrors++;

  // Track by type
  const errorType = error.metadata.name || error.type;
  summary.errorsByType[errorType] =
    (summary.errorsByType[errorType] || 0) + 1;

  // Track by file
  const file = error.source.file;
  summary.errorsByFile[file] =
    (summary.errorsByFile[file] || 0) + 1;

  // Check if critical
  if (error.message.toLowerCase().includes('fatal') ||
      error.message.toLowerCase().includes('crash') ||
      error.type === 'exception') {
    summary.criticalErrors++;
  }
}
```

### Source Map Resolution

```typescript
// error-tracker/source-map-resolver.ts
import { SourceMapConsumer } from 'source-map';
import * as fs from 'fs';
import * as path from 'path';

interface ResolvedLocation {
  originalFile: string;
  originalLine: number;
  originalColumn: number;
  originalName: string | null;
  sourceContent: string | null;
}

interface EnhancedError extends CapturedError {
  resolvedSource?: ResolvedLocation;
  codeSnippet?: string;
}

async function resolveSourceMap(
  error: CapturedError,
  sourceMapDir: string
): Promise<EnhancedError> {
  const enhanced: EnhancedError = { ...error };

  try {
    // Find source map file
    const mapFile = `${error.source.file}.map`;
    const mapPath = path.join(sourceMapDir, path.basename(mapFile));

    if (!fs.existsSync(mapPath)) {
      return enhanced;
    }

    const rawSourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
    const consumer = await new SourceMapConsumer(rawSourceMap);

    // Resolve original position
    const originalPosition = consumer.originalPositionFor({
      line: error.source.line,
      column: error.source.column
    });

    if (originalPosition.source) {
      enhanced.resolvedSource = {
        originalFile: originalPosition.source,
        originalLine: originalPosition.line || 0,
        originalColumn: originalPosition.column || 0,
        originalName: originalPosition.name,
        sourceContent: consumer.sourceContentFor(originalPosition.source)
      };

      // Extract code snippet
      if (enhanced.resolvedSource.sourceContent) {
        enhanced.codeSnippet = extractCodeSnippet(
          enhanced.resolvedSource.sourceContent,
          originalPosition.line || 0
        );
      }
    }

    consumer.destroy();
  } catch (err) {
    // Source map resolution failed, return original error
  }

  return enhanced;
}

function extractCodeSnippet(
  source: string,
  line: number,
  contextLines: number = 3
): string {
  const lines = source.split('\n');
  const start = Math.max(0, line - contextLines - 1);
  const end = Math.min(lines.length, line + contextLines);

  return lines
    .slice(start, end)
    .map((content, i) => {
      const lineNum = start + i + 1;
      const marker = lineNum === line ? '>' : ' ';
      return `${marker} ${lineNum.toString().padStart(4)} | ${content}`;
    })
    .join('\n');
}

async function resolveFullStackTrace(
  error: CapturedError,
  sourceMapDir: string
): Promise<string> {
  const stackLines = error.stack.split('\n');
  const resolvedLines: string[] = [];

  for (const line of stackLines) {
    const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);

    if (match) {
      const [, fnName, file, lineNum, col] = match;

      const resolved = await resolveSourceMap({
        ...error,
        source: {
          file,
          line: parseInt(lineNum),
          column: parseInt(col)
        }
      }, sourceMapDir);

      if (resolved.resolvedSource) {
        resolvedLines.push(
          `    at ${fnName} (${resolved.resolvedSource.originalFile}:${resolved.resolvedSource.originalLine}:${resolved.resolvedSource.originalColumn})`
        );
      } else {
        resolvedLines.push(line);
      }
    } else {
      resolvedLines.push(line);
    }
  }

  return resolvedLines.join('\n');
}
```

### Error Pattern Detection

```typescript
// error-tracker/pattern-detector.ts

interface ErrorPattern {
  name: string;
  frequency: number;
  errors: CapturedError[];
  commonCause: string;
  suggestedFix: string;
}

function detectErrorPatterns(errors: CapturedError[]): ErrorPattern[] {
  const patterns: ErrorPattern[] = [];

  // Group similar errors
  const errorGroups = groupSimilarErrors(errors);

  for (const [key, groupedErrors] of errorGroups) {
    if (groupedErrors.length >= 2) {
      patterns.push({
        name: key,
        frequency: groupedErrors.length,
        errors: groupedErrors,
        commonCause: identifyCommonCause(groupedErrors),
        suggestedFix: generateFixSuggestion(groupedErrors)
      });
    }
  }

  // Sort by frequency
  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function groupSimilarErrors(
  errors: CapturedError[]
): Map<string, CapturedError[]> {
  const groups = new Map<string, CapturedError[]>();

  for (const error of errors) {
    // Create a fingerprint for the error
    const fingerprint = createErrorFingerprint(error);

    if (!groups.has(fingerprint)) {
      groups.set(fingerprint, []);
    }
    groups.get(fingerprint)!.push(error);
  }

  return groups;
}

function createErrorFingerprint(error: CapturedError): string {
  // Normalize the error message
  const normalizedMessage = error.message
    .replace(/\d+/g, 'N')
    .replace(/'[^']+'/g, "'X'")
    .replace(/"[^"]+"/g, '"X"');

  // Use file and line as part of fingerprint
  return `${error.source.file}:${error.source.line}:${normalizedMessage.substring(0, 100)}`;
}

function identifyCommonCause(errors: CapturedError[]): string {
  // Analyze common patterns in the grouped errors
  const messages = errors.map(e => e.message);
  const files = errors.map(e => e.source.file);

  // Check for common error types
  if (messages.every(m => m.includes('undefined'))) {
    return 'Accessing property of undefined value';
  }

  if (messages.every(m => m.includes('null'))) {
    return 'Null reference error';
  }

  if (messages.every(m => m.includes('network') || m.includes('fetch'))) {
    return 'Network request failure';
  }

  return 'Unknown common cause';
}

function generateFixSuggestion(errors: CapturedError[]): string {
  const message = errors[0].message.toLowerCase();

  if (message.includes('cannot read property') ||
      message.includes('undefined')) {
    return 'Add null/undefined checks before accessing properties. Consider using optional chaining (?.)';
  }

  if (message.includes('is not a function')) {
    return 'Verify the function exists and is properly imported. Check for typos in function names.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Add error handling for network requests. Implement retry logic and offline support.';
  }

  return 'Review the error context and add appropriate error handling.';
}
```

## AI-Powered Error Analysis

### Intelligent Stack Trace Analysis

```typescript
// error-tracker/ai-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';

interface ErrorAnalysis {
  rootCause: string;
  errorType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedFunctionality: string;
  fix: CodeFix;
  relatedIssues: string[];
  preventionTips: string[];
}

interface CodeFix {
  file: string;
  line: number;
  before: string;
  after: string;
  explanation: string;
}

async function analyzeError(
  error: EnhancedError,
  additionalContext?: string
): Promise<ErrorAnalysis> {
  const client = new Anthropic();

  const prompt = `Analyze this JavaScript error and provide a fix:

## Error Message
${error.message}

## Stack Trace
${error.stack}

## Original Source (if available)
${error.resolvedSource ? `
File: ${error.resolvedSource.originalFile}
Line: ${error.resolvedSource.originalLine}

Code:
\`\`\`javascript
${error.codeSnippet}
\`\`\`
` : 'Source map not available'}

${additionalContext ? `## Additional Context\n${additionalContext}` : ''}

Provide:
1. Root cause explanation
2. Error type classification
3. Severity assessment (critical/high/medium/low)
4. What functionality is affected
5. Specific code fix with before/after
6. Related issues to check for
7. Prevention tips for the future

Format as JSON.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(response.content[0].text);
}

async function analyzeBatchErrors(
  errors: CapturedError[]
): Promise<BatchAnalysis> {
  const client = new Anthropic();

  const errorSummary = errors.slice(0, 20).map(e => ({
    message: e.message,
    file: e.source.file,
    line: e.source.line,
    count: 1 // Would aggregate in real implementation
  }));

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `Analyze these ${errors.length} errors from a web application:

${JSON.stringify(errorSummary, null, 2)}

Provide:
1. Overall error health assessment
2. Top 3 most critical issues to fix
3. Common patterns across errors
4. Recommended fixes in priority order
5. Estimated time to fix each issue
6. Testing recommendations after fixes`
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

## Error Monitoring Integration

### Error Aggregation and Trending

```typescript
// error-tracker/aggregator.ts

interface ErrorTrend {
  errorKey: string;
  counts: { timestamp: number; count: number }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
}

function calculateErrorTrends(
  errorHistory: CapturedError[],
  windowSize: number = 3600000 // 1 hour
): ErrorTrend[] {
  const trends: ErrorTrend[] = [];

  // Group errors by fingerprint
  const grouped = groupSimilarErrors(errorHistory);

  for (const [key, errors] of grouped) {
    // Create time buckets
    const buckets = new Map<number, number>();
    const now = Date.now();

    for (const error of errors) {
      const bucket = Math.floor(error.timestamp / windowSize) * windowSize;
      buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
    }

    // Convert to array and sort
    const counts = Array.from(buckets.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate trend
    const trend = calculateTrendDirection(counts);

    trends.push({
      errorKey: key,
      counts,
      trend: trend.direction,
      changePercent: trend.percent
    });
  }

  return trends.sort((a, b) =>
    Math.abs(b.changePercent) - Math.abs(a.changePercent)
  );
}

function calculateTrendDirection(
  counts: { timestamp: number; count: number }[]
): { direction: 'increasing' | 'decreasing' | 'stable'; percent: number } {
  if (counts.length < 2) {
    return { direction: 'stable', percent: 0 };
  }

  const firstHalf = counts.slice(0, Math.floor(counts.length / 2));
  const secondHalf = counts.slice(Math.floor(counts.length / 2));

  const firstAvg = firstHalf.reduce((sum, c) => sum + c.count, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, c) => sum + c.count, 0) / secondHalf.length;

  const changePercent = firstAvg === 0 ? 100 :
    ((secondAvg - firstAvg) / firstAvg) * 100;

  let direction: 'increasing' | 'decreasing' | 'stable';
  if (changePercent > 10) {
    direction = 'increasing';
  } else if (changePercent < -10) {
    direction = 'decreasing';
  } else {
    direction = 'stable';
  }

  return { direction, percent: changePercent };
}
```

### Error Alert System

```typescript
// error-tracker/alerts.ts

interface AlertRule {
  name: string;
  condition: (errors: CapturedError[]) => boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

const defaultAlertRules: AlertRule[] = [
  {
    name: 'High Error Rate',
    condition: (errors) => errors.length > 50,
    severity: 'critical',
    message: 'Error rate exceeds threshold'
  },
  {
    name: 'New Error Type',
    condition: (errors) => {
      // Check if there's a new error type not seen before
      return false; // Implementation needed
    },
    severity: 'warning',
    message: 'New error type detected'
  },
  {
    name: 'Regression',
    condition: (errors) => {
      // Check if a previously fixed error has returned
      return false; // Implementation needed
    },
    severity: 'critical',
    message: 'Previously fixed error has regressed'
  }
];

function checkAlerts(
  errors: CapturedError[],
  rules: AlertRule[] = defaultAlertRules
): Alert[] {
  const alerts: Alert[] = [];

  for (const rule of rules) {
    if (rule.condition(errors)) {
      alerts.push({
        rule: rule.name,
        severity: rule.severity,
        message: rule.message,
        timestamp: Date.now(),
        errorCount: errors.length
      });
    }
  }

  return alerts;
}
```

## Error Testing

### Error Injection for Testing

```typescript
// error-tracker/error-injection.ts
import { Page } from '@playwright/test';

async function injectError(
  page: Page,
  errorType: 'runtime' | 'network' | 'async' | 'react',
  options: ErrorInjectionOptions = {}
): Promise<void> {
  switch (errorType) {
    case 'runtime':
      await page.evaluate((msg) => {
        throw new Error(msg || 'Injected runtime error');
      }, options.message);
      break;

    case 'network':
      await page.route('**/*', route => route.abort('failed'));
      break;

    case 'async':
      await page.evaluate((msg) => {
        Promise.reject(new Error(msg || 'Injected async error'));
      }, options.message);
      break;

    case 'react':
      await page.evaluate(() => {
        const event = new CustomEvent('react-error', {
          detail: { error: new Error('Injected React error') }
        });
        window.dispatchEvent(event);
      });
      break;
  }
}

async function testErrorBoundary(page: Page): Promise<boolean> {
  // Inject an error and verify the error boundary catches it
  await injectError(page, 'react');

  // Check if error boundary rendered
  const errorBoundary = await page.$('[data-testid="error-boundary"]');
  return errorBoundary !== null;
}
```

## Deliverables

### Error Report Template

```markdown
# Error Analysis Report

## Summary
- **Total Errors:** X
- **Critical:** X
- **Unique Errors:** X
- **Affected Users:** X%

## Critical Issues

### 1. TypeError: Cannot read property 'X' of undefined
**Frequency:** 150 occurrences
**Severity:** Critical
**First Seen:** 2024-01-15 10:30:00

#### Stack Trace
```
TypeError: Cannot read property 'name' of undefined
    at UserProfile (src/components/UserProfile.tsx:42:18)
    at renderWithHooks (react-dom.development.js:14985:18)
```

#### Root Cause
The `user` object is not loaded when the component renders, but the code assumes it exists.

#### Code Fix
```typescript
// Before (line 42)
const name = user.name;

// After
const name = user?.name ?? 'Loading...';
```

#### Prevention
- Add loading states for async data
- Use TypeScript strict null checks
- Add error boundaries around user-dependent components

## Error Trends

| Error | Last Hour | Last Day | Trend |
|-------|-----------|----------|-------|
| TypeError | 50 | 200 | ↑ 25% |
| NetworkError | 30 | 100 | ↓ 10% |
| SyntaxError | 5 | 20 | → 0% |

## Recommendations

1. **Immediate:** Fix null reference errors in UserProfile
2. **Short-term:** Add error boundaries to all routes
3. **Long-term:** Implement error monitoring service
```

## Usage Prompts

### Error Investigation
```
Investigate this error occurring in production:

TypeError: Cannot read property 'id' of undefined
at ProductCard.tsx:28

Please:
1. Analyze the stack trace
2. Identify the root cause
3. Provide a specific fix
4. Suggest how to prevent similar errors
```

### Error Pattern Analysis
```
Analyze errors from the last 24 hours:
1. Group similar errors
2. Identify patterns
3. Prioritize by impact
4. Provide fixes for top 5 issues
```

### Error Health Check
```
Perform an error health check:
1. Summarize current error state
2. Identify trending issues
3. Check for regressions
4. Recommend monitoring improvements
```
