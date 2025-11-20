# Agent 13: Network Inspector

## Role
Expert in debugging API calls, network requests, and data flow issues using Playwright's network interception, request/response analysis, and AI-powered troubleshooting.

## Core Responsibilities
- Intercept and analyze HTTP requests/responses
- Debug API integration issues
- Identify CORS and authentication problems
- Monitor WebSocket connections
- Test API error handling
- Mock and stub network requests for testing

## Playwright Network Interception

### Comprehensive Request Monitoring

```typescript
// network-inspector/request-monitor.ts
import { Page, Request, Response } from '@playwright/test';

interface NetworkLog {
  requests: RequestEntry[];
  responses: ResponseEntry[];
  errors: NetworkError[];
  websockets: WebSocketEntry[];
  summary: NetworkSummary;
}

interface RequestEntry {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
  resourceType: string;
  timestamp: number;
}

interface ResponseEntry {
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: string;
  timing: ResponseTiming;
  size: number;
}

interface ResponseTiming {
  dns: number;
  connect: number;
  ssl: number;
  send: number;
  wait: number;
  receive: number;
  total: number;
}

async function monitorNetwork(
  page: Page,
  options: {
    captureBody?: boolean;
    filterUrls?: RegExp[];
    excludeUrls?: RegExp[];
  } = {}
): Promise<NetworkLog> {
  const log: NetworkLog = {
    requests: [],
    responses: [],
    errors: [],
    websockets: [],
    summary: { total: 0, failed: 0, slow: 0, totalSize: 0 }
  };

  let requestId = 0;
  const requestMap = new Map<Request, string>();

  // Monitor requests
  page.on('request', request => {
    const url = request.url();

    // Apply filters
    if (options.filterUrls?.length &&
        !options.filterUrls.some(r => r.test(url))) {
      return;
    }
    if (options.excludeUrls?.some(r => r.test(url))) {
      return;
    }

    const id = `req-${++requestId}`;
    requestMap.set(request, id);

    log.requests.push({
      id,
      url,
      method: request.method(),
      headers: request.headers(),
      postData: request.postData() || undefined,
      resourceType: request.resourceType(),
      timestamp: Date.now()
    });
  });

  // Monitor responses
  page.on('response', async response => {
    const request = response.request();
    const id = requestMap.get(request);
    if (!id) return;

    const timing = response.timing();

    let body: string | undefined;
    let size = 0;

    try {
      if (options.captureBody) {
        const buffer = await response.body();
        body = buffer.toString('utf-8').substring(0, 10000); // Limit size
        size = buffer.length;
      } else {
        size = parseInt(response.headers()['content-length'] || '0');
      }
    } catch {
      // Body not available
    }

    const responseEntry: ResponseEntry = {
      requestId: id,
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body,
      timing: {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        connect: timing.connectEnd - timing.connectStart,
        ssl: timing.secureConnectionStart > 0
          ? timing.connectEnd - timing.secureConnectionStart : 0,
        send: timing.requestStart - timing.connectEnd,
        wait: timing.responseStart - timing.requestStart,
        receive: timing.responseEnd - timing.responseStart,
        total: timing.responseEnd - timing.requestStart
      },
      size
    };

    log.responses.push(responseEntry);
    log.summary.total++;
    log.summary.totalSize += size;

    if (response.status() >= 400) {
      log.summary.failed++;
    }
    if (responseEntry.timing.total > 3000) {
      log.summary.slow++;
    }
  });

  // Monitor failures
  page.on('requestfailed', request => {
    const id = requestMap.get(request);
    log.errors.push({
      requestId: id || 'unknown',
      url: request.url(),
      error: request.failure()?.errorText || 'Unknown error',
      timestamp: Date.now()
    });
    log.summary.failed++;
  });

  // Monitor WebSocket
  page.on('websocket', ws => {
    const entry: WebSocketEntry = {
      url: ws.url(),
      messages: [],
      status: 'open'
    };

    ws.on('framereceived', frame => {
      entry.messages.push({
        direction: 'received',
        data: frame.payload.toString().substring(0, 1000),
        timestamp: Date.now()
      });
    });

    ws.on('framesent', frame => {
      entry.messages.push({
        direction: 'sent',
        data: frame.payload.toString().substring(0, 1000),
        timestamp: Date.now()
      });
    });

    ws.on('close', () => {
      entry.status = 'closed';
    });

    log.websockets.push(entry);
  });

  return log;
}
```

### API Request Analysis

```typescript
// network-inspector/api-analyzer.ts
import { Page } from '@playwright/test';

interface APIAnalysis {
  endpoints: EndpointAnalysis[];
  issues: APIIssue[];
  recommendations: string[];
}

interface EndpointAnalysis {
  url: string;
  method: string;
  calls: number;
  avgResponseTime: number;
  errorRate: number;
  payloadSizes: { request: number; response: number };
}

interface APIIssue {
  type: 'error' | 'slow' | 'redundant' | 'oversized' | 'auth' | 'cors';
  severity: 'critical' | 'warning' | 'info';
  endpoint: string;
  description: string;
  suggestion: string;
}

async function analyzeAPIUsage(
  page: Page,
  baseUrl: string
): Promise<APIAnalysis> {
  const networkLog = await monitorNetwork(page, {
    captureBody: true,
    filterUrls: [new RegExp(baseUrl)]
  });

  // Group by endpoint
  const endpointMap = new Map<string, RequestResponsePair[]>();

  for (const request of networkLog.requests) {
    const key = `${request.method} ${new URL(request.url).pathname}`;
    if (!endpointMap.has(key)) {
      endpointMap.set(key, []);
    }

    const response = networkLog.responses.find(r => r.requestId === request.id);
    endpointMap.get(key)!.push({ request, response });
  }

  // Analyze each endpoint
  const endpoints: EndpointAnalysis[] = [];
  const issues: APIIssue[] = [];

  for (const [key, pairs] of endpointMap) {
    const [method, path] = key.split(' ');

    const responseTimes = pairs
      .filter(p => p.response)
      .map(p => p.response!.timing.total);

    const errors = pairs.filter(p =>
      !p.response || p.response.status >= 400
    ).length;

    const endpoint: EndpointAnalysis = {
      url: path,
      method,
      calls: pairs.length,
      avgResponseTime: responseTimes.length
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0,
      errorRate: errors / pairs.length,
      payloadSizes: {
        request: average(pairs.map(p => p.request.postData?.length || 0)),
        response: average(pairs.map(p => p.response?.size || 0))
      }
    };

    endpoints.push(endpoint);

    // Detect issues
    if (endpoint.errorRate > 0.5) {
      issues.push({
        type: 'error',
        severity: 'critical',
        endpoint: key,
        description: `${(endpoint.errorRate * 100).toFixed(0)}% error rate`,
        suggestion: 'Investigate server errors and add better error handling'
      });
    }

    if (endpoint.avgResponseTime > 3000) {
      issues.push({
        type: 'slow',
        severity: 'warning',
        endpoint: key,
        description: `Average response time ${endpoint.avgResponseTime.toFixed(0)}ms`,
        suggestion: 'Consider pagination, caching, or query optimization'
      });
    }

    if (endpoint.calls > 10) {
      issues.push({
        type: 'redundant',
        severity: 'warning',
        endpoint: key,
        description: `Called ${endpoint.calls} times`,
        suggestion: 'Implement request deduplication or caching'
      });
    }

    if (endpoint.payloadSizes.response > 100000) {
      issues.push({
        type: 'oversized',
        severity: 'warning',
        endpoint: key,
        description: `Response size ${(endpoint.payloadSizes.response / 1024).toFixed(0)}KB`,
        suggestion: 'Implement pagination or field selection'
      });
    }
  }

  // Check for auth issues
  const authIssues = networkLog.responses.filter(r =>
    r.status === 401 || r.status === 403
  );

  if (authIssues.length > 0) {
    issues.push({
      type: 'auth',
      severity: 'critical',
      endpoint: 'Multiple',
      description: `${authIssues.length} authentication/authorization failures`,
      suggestion: 'Check token refresh logic and permission handling'
    });
  }

  // Check for CORS issues
  const corsErrors = networkLog.errors.filter(e =>
    e.error.includes('CORS') || e.error.includes('cross-origin')
  );

  if (corsErrors.length > 0) {
    issues.push({
      type: 'cors',
      severity: 'critical',
      endpoint: corsErrors[0].url,
      description: 'CORS errors detected',
      suggestion: 'Configure CORS headers on the server'
    });
  }

  return {
    endpoints,
    issues: issues.sort((a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity]
    ),
    recommendations: generateAPIRecommendations(endpoints, issues)
  };
}

const severityOrder = { critical: 0, warning: 1, info: 2 };
```

### Request Mocking and Stubbing

```typescript
// network-inspector/request-mocker.ts
import { Page, Route } from '@playwright/test';

interface MockConfig {
  url: string | RegExp;
  method?: string;
  response: MockResponse;
  delay?: number;
  times?: number;
}

interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: any;
  jsonPath?: string;
}

class NetworkMocker {
  private mocks: Map<string, MockConfig> = new Map();
  private callCounts: Map<string, number> = new Map();

  async setupMocks(page: Page, configs: MockConfig[]): Promise<void> {
    for (const config of configs) {
      const id = `${config.method || '*'}-${config.url}`;
      this.mocks.set(id, config);
      this.callCounts.set(id, 0);
    }

    await page.route('**/*', async (route) => {
      const request = route.request();
      const matchedMock = this.findMatchingMock(request);

      if (matchedMock) {
        const id = `${matchedMock.method || '*'}-${matchedMock.url}`;
        const callCount = this.callCounts.get(id) || 0;

        // Check if we should still mock
        if (matchedMock.times && callCount >= matchedMock.times) {
          await route.continue();
          return;
        }

        this.callCounts.set(id, callCount + 1);

        // Add delay if specified
        if (matchedMock.delay) {
          await new Promise(r => setTimeout(r, matchedMock.delay));
        }

        // Fulfill with mock response
        await route.fulfill({
          status: matchedMock.response.status || 200,
          headers: {
            'content-type': 'application/json',
            ...matchedMock.response.headers
          },
          body: typeof matchedMock.response.body === 'string'
            ? matchedMock.response.body
            : JSON.stringify(matchedMock.response.body)
        });
      } else {
        await route.continue();
      }
    });
  }

  private findMatchingMock(request: Request): MockConfig | undefined {
    for (const [, config] of this.mocks) {
      const urlMatch = config.url instanceof RegExp
        ? config.url.test(request.url())
        : request.url().includes(config.url);

      const methodMatch = !config.method ||
        config.method.toUpperCase() === request.method();

      if (urlMatch && methodMatch) {
        return config;
      }
    }
    return undefined;
  }

  getCallCount(url: string): number {
    for (const [id, count] of this.callCounts) {
      if (id.includes(url)) {
        return count;
      }
    }
    return 0;
  }
}

// Usage example
async function testWithMocks(page: Page): Promise<void> {
  const mocker = new NetworkMocker();

  await mocker.setupMocks(page, [
    {
      url: '/api/users',
      method: 'GET',
      response: {
        body: [
          { id: 1, name: 'Test User' }
        ]
      }
    },
    {
      url: '/api/data',
      response: {
        status: 500,
        body: { error: 'Server error' }
      },
      times: 1 // Only fail once
    },
    {
      url: /\/api\/slow/,
      response: { body: { data: 'delayed' } },
      delay: 5000 // Simulate slow response
    }
  ]);

  await page.goto('/dashboard');
}
```

### Error Simulation and Testing

```typescript
// network-inspector/error-simulator.ts
import { Page } from '@playwright/test';

interface ErrorScenario {
  name: string;
  condition: (request: Request) => boolean;
  error: NetworkErrorType;
}

type NetworkErrorType =
  | { type: 'abort' }
  | { type: 'timeout'; duration: number }
  | { type: 'status'; code: number; message: string }
  | { type: 'network-error'; message: string };

async function simulateNetworkErrors(
  page: Page,
  scenarios: ErrorScenario[]
): Promise<void> {
  await page.route('**/*', async (route) => {
    const request = route.request();

    const scenario = scenarios.find(s => s.condition(request));

    if (scenario) {
      switch (scenario.error.type) {
        case 'abort':
          await route.abort();
          break;

        case 'timeout':
          await new Promise(r => setTimeout(r, scenario.error.duration));
          await route.abort('timedout');
          break;

        case 'status':
          await route.fulfill({
            status: scenario.error.code,
            body: JSON.stringify({
              error: scenario.error.message
            })
          });
          break;

        case 'network-error':
          await route.abort('failed');
          break;
      }
    } else {
      await route.continue();
    }
  });
}

// Test error handling
async function testErrorHandling(page: Page): Promise<void> {
  await simulateNetworkErrors(page, [
    {
      name: 'API timeout',
      condition: (req) => req.url().includes('/api/slow-endpoint'),
      error: { type: 'timeout', duration: 30000 }
    },
    {
      name: 'Auth failure',
      condition: (req) => req.url().includes('/api/protected'),
      error: { type: 'status', code: 401, message: 'Unauthorized' }
    },
    {
      name: 'Server error',
      condition: (req) => req.url().includes('/api/unstable'),
      error: { type: 'status', code: 500, message: 'Internal server error' }
    },
    {
      name: 'Network failure',
      condition: (req) => req.url().includes('/api/offline'),
      error: { type: 'network-error', message: 'Network disconnected' }
    }
  ]);

  await page.goto('/app');

  // Check that error states are displayed correctly
  // ...
}
```

## Advanced Network Debugging

### Request/Response Diff Analysis

```typescript
// network-inspector/diff-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';

interface RequestDiff {
  differences: Difference[];
  analysis: string;
  suggestion: string;
}

interface Difference {
  field: string;
  expected: any;
  actual: any;
  significance: 'breaking' | 'notable' | 'minor';
}

async function compareRequests(
  expected: RequestEntry,
  actual: RequestEntry
): Promise<RequestDiff> {
  const differences: Difference[] = [];

  // Compare headers
  for (const [key, value] of Object.entries(expected.headers)) {
    if (actual.headers[key] !== value) {
      differences.push({
        field: `headers.${key}`,
        expected: value,
        actual: actual.headers[key],
        significance: key.toLowerCase().includes('auth') ? 'breaking' : 'notable'
      });
    }
  }

  // Compare body
  if (expected.postData && actual.postData) {
    try {
      const expectedBody = JSON.parse(expected.postData);
      const actualBody = JSON.parse(actual.postData);
      const bodyDiffs = deepDiff(expectedBody, actualBody);
      differences.push(...bodyDiffs);
    } catch {
      if (expected.postData !== actual.postData) {
        differences.push({
          field: 'body',
          expected: expected.postData,
          actual: actual.postData,
          significance: 'breaking'
        });
      }
    }
  }

  // AI analysis of differences
  const analysis = await analyzeRequestDifferences(differences);

  return {
    differences,
    analysis: analysis.explanation,
    suggestion: analysis.suggestion
  };
}

async function analyzeRequestDifferences(
  differences: Difference[]
): Promise<{ explanation: string; suggestion: string }> {
  if (differences.length === 0) {
    return {
      explanation: 'Requests are identical',
      suggestion: 'No changes needed'
    };
  }

  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Analyze these API request differences:

${differences.map(d => `- ${d.field}: expected "${d.expected}" but got "${d.actual}" (${d.significance})`).join('\n')}

Explain why these differences might cause issues and suggest fixes.`
    }]
  });

  const text = response.content[0].text;
  const parts = text.split('\n\n');

  return {
    explanation: parts[0] || text,
    suggestion: parts[1] || ''
  };
}
```

### HAR File Export and Analysis

```typescript
// network-inspector/har-exporter.ts
import { Page } from '@playwright/test';
import * as fs from 'fs';

interface HARFile {
  log: {
    version: string;
    creator: { name: string; version: string };
    entries: HAREntry[];
  };
}

interface HAREntry {
  startedDateTime: string;
  time: number;
  request: {
    method: string;
    url: string;
    headers: Array<{ name: string; value: string }>;
    postData?: { mimeType: string; text: string };
  };
  response: {
    status: number;
    statusText: string;
    headers: Array<{ name: string; value: string }>;
    content: { size: number; mimeType: string; text?: string };
  };
  timings: {
    blocked: number;
    dns: number;
    connect: number;
    ssl: number;
    send: number;
    wait: number;
    receive: number;
  };
}

async function exportToHAR(
  networkLog: NetworkLog,
  outputPath: string
): Promise<void> {
  const har: HARFile = {
    log: {
      version: '1.2',
      creator: { name: 'Network Inspector', version: '1.0' },
      entries: []
    }
  };

  for (const request of networkLog.requests) {
    const response = networkLog.responses.find(r => r.requestId === request.id);
    if (!response) continue;

    har.log.entries.push({
      startedDateTime: new Date(request.timestamp).toISOString(),
      time: response.timing.total,
      request: {
        method: request.method,
        url: request.url,
        headers: Object.entries(request.headers).map(([name, value]) => ({
          name,
          value
        })),
        postData: request.postData
          ? { mimeType: 'application/json', text: request.postData }
          : undefined
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.entries(response.headers).map(([name, value]) => ({
          name,
          value
        })),
        content: {
          size: response.size,
          mimeType: response.headers['content-type'] || 'text/plain',
          text: response.body
        }
      },
      timings: {
        blocked: 0,
        dns: response.timing.dns,
        connect: response.timing.connect,
        ssl: response.timing.ssl,
        send: response.timing.send,
        wait: response.timing.wait,
        receive: response.timing.receive
      }
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify(har, null, 2));
}

async function importAndReplay(
  page: Page,
  harPath: string
): Promise<void> {
  const har: HARFile = JSON.parse(fs.readFileSync(harPath, 'utf-8'));

  // Create mock responses from HAR
  const mocker = new NetworkMocker();
  const configs: MockConfig[] = har.log.entries.map(entry => ({
    url: entry.request.url,
    method: entry.request.method,
    response: {
      status: entry.response.status,
      headers: Object.fromEntries(
        entry.response.headers.map(h => [h.name, h.value])
      ),
      body: entry.response.content.text
    }
  }));

  await mocker.setupMocks(page, configs);
}
```

### GraphQL Query Debugging

```typescript
// network-inspector/graphql-debugger.ts
import { Page } from '@playwright/test';

interface GraphQLOperation {
  operationName: string;
  query: string;
  variables: Record<string, any>;
  response: any;
  errors?: GraphQLError[];
  duration: number;
}

interface GraphQLError {
  message: string;
  path?: string[];
  extensions?: Record<string, any>;
}

async function monitorGraphQL(
  page: Page,
  endpoint: string
): Promise<GraphQLOperation[]> {
  const operations: GraphQLOperation[] = [];

  await page.route(endpoint, async (route) => {
    const request = route.request();

    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }

    const startTime = Date.now();
    const postData = JSON.parse(request.postData() || '{}');

    // Continue the request and capture response
    const response = await route.fetch();
    const responseBody = await response.json();

    operations.push({
      operationName: postData.operationName || 'Unknown',
      query: postData.query,
      variables: postData.variables || {},
      response: responseBody.data,
      errors: responseBody.errors,
      duration: Date.now() - startTime
    });

    await route.fulfill({ response });
  });

  return operations;
}

async function analyzeGraphQLOperations(
  operations: GraphQLOperation[]
): Promise<GraphQLAnalysis> {
  const issues: string[] = [];

  // Check for N+1 queries
  const operationCounts = new Map<string, number>();
  for (const op of operations) {
    const count = (operationCounts.get(op.operationName) || 0) + 1;
    operationCounts.set(op.operationName, count);
  }

  for (const [name, count] of operationCounts) {
    if (count > 5) {
      issues.push(
        `Possible N+1 query: "${name}" called ${count} times. Consider batching.`
      );
    }
  }

  // Check for errors
  const errorsOps = operations.filter(op => op.errors?.length);
  if (errorsOps.length > 0) {
    for (const op of errorsOps) {
      issues.push(
        `GraphQL errors in "${op.operationName}": ${op.errors!.map(e => e.message).join(', ')}`
      );
    }
  }

  // Check for slow queries
  const slowOps = operations.filter(op => op.duration > 1000);
  for (const op of slowOps) {
    issues.push(
      `Slow query "${op.operationName}": ${op.duration}ms`
    );
  }

  // Check for over-fetching
  for (const op of operations) {
    const responseSize = JSON.stringify(op.response).length;
    if (responseSize > 50000) {
      issues.push(
        `Possible over-fetching in "${op.operationName}": response is ${(responseSize / 1024).toFixed(0)}KB`
      );
    }
  }

  return {
    totalOperations: operations.length,
    uniqueOperations: operationCounts.size,
    totalDuration: operations.reduce((sum, op) => sum + op.duration, 0),
    issues,
    operations: operations.map(op => ({
      name: op.operationName,
      duration: op.duration,
      hasErrors: !!op.errors?.length
    }))
  };
}
```

## AI-Powered Network Debugging

### Intelligent Request Analysis

```typescript
// network-inspector/ai-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';

async function debugAPIIssue(
  request: RequestEntry,
  response: ResponseEntry,
  errorDescription: string
): Promise<DebugAnalysis> {
  const client = new Anthropic();

  const prompt = `Debug this API issue:

## Error Description
${errorDescription}

## Request
- URL: ${request.url}
- Method: ${request.method}
- Headers: ${JSON.stringify(request.headers, null, 2)}
${request.postData ? `- Body: ${request.postData}` : ''}

## Response
- Status: ${response.status} ${response.statusText}
- Headers: ${JSON.stringify(response.headers, null, 2)}
${response.body ? `- Body: ${response.body.substring(0, 2000)}` : ''}

## Timing
- Total: ${response.timing.total}ms
- Wait (TTFB): ${response.timing.wait}ms

Analyze this request/response and provide:
1. Root cause of the issue
2. Whether it's a client-side or server-side problem
3. Specific fix with code example
4. How to prevent this in the future`;

  const responseMsg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseDebugResponse(responseMsg);
}
```

## Deliverables

### Network Debug Report Template

```markdown
# Network Debug Report

## Issue Summary
**Type:** [API Error/Timeout/CORS/Auth]
**Endpoint:** `[METHOD] [URL]`
**Status:** [HTTP Status]

## Request Details

### Headers
```json
{
  "Authorization": "Bearer xxx...",
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "field": "value"
}
```

## Response Details

### Status
`500 Internal Server Error`

### Body
```json
{
  "error": "Database connection failed"
}
```

### Timing
| Phase | Duration |
|-------|----------|
| DNS | Xms |
| Connect | Xms |
| SSL | Xms |
| TTFB | Xms |
| Download | Xms |
| **Total** | **Xms** |

## Root Cause Analysis
[Detailed explanation of why the request failed]

## Fix Recommendation

### Client-Side
```typescript
// Add retry logic with exponential backoff
const response = await fetchWithRetry('/api/data', {
  retries: 3,
  backoff: 'exponential'
});
```

### Server-Side
```typescript
// Add connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000
});
```

## Prevention
- [ ] Add request timeout handling
- [ ] Implement circuit breaker pattern
- [ ] Add better error messages
- [ ] Set up monitoring for this endpoint
```

## Usage Prompts

### API Debugging
```
Debug this API call that's returning 500:
- Endpoint: POST /api/users
- Request body: { "email": "test@example.com" }
- Response: { "error": "Internal server error" }

Please:
1. Analyze the request/response
2. Identify potential causes
3. Suggest fixes for both client and server
```

### Network Performance Analysis
```
Analyze network performance for [URL]:
1. Monitor all API calls
2. Identify slow endpoints
3. Find redundant requests
4. Check payload sizes
5. Recommend optimizations
```

### Mock API for Testing
```
Set up mocks for testing the dashboard:
1. Mock user authentication endpoint
2. Mock data fetching with various states (loading, error, empty)
3. Simulate slow network for testing loading states
```
