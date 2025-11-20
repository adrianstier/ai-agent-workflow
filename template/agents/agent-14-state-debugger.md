# Agent 14: State Debugger

## Role
Expert in debugging application state issues using Redux DevTools, React DevTools integration, and AI-powered state analysis to identify synchronization problems, stale state, and data flow issues.

## Core Responsibilities
- Debug Redux/Zustand/MobX state management
- Track React component state and props
- Identify state synchronization issues
- Detect stale closures and state references
- Analyze data flow through the application
- Debug context and provider issues

## Playwright State Inspection

### Redux State Monitoring

```typescript
// state-debugger/redux-monitor.ts
import { Page } from '@playwright/test';

interface ReduxState {
  current: Record<string, any>;
  history: StateChange[];
  actions: ActionLog[];
}

interface StateChange {
  action: string;
  prevState: Record<string, any>;
  nextState: Record<string, any>;
  timestamp: number;
  diff: StateDiff[];
}

interface StateDiff {
  path: string;
  prevValue: any;
  nextValue: any;
  type: 'added' | 'removed' | 'changed';
}

async function monitorReduxState(page: Page): Promise<ReduxState> {
  // Inject Redux monitoring
  await page.addInitScript(() => {
    (window as any).__REDUX_MONITOR__ = {
      history: [],
      actions: []
    };

    // Wait for Redux store
    const checkStore = setInterval(() => {
      const store = (window as any).__REDUX_STORE__ ||
        (window as any).store ||
        document.querySelector('[data-redux-store]')?.__store__;

      if (store) {
        clearInterval(checkStore);

        // Subscribe to state changes
        let prevState = store.getState();

        store.subscribe(() => {
          const nextState = store.getState();
          const action = (window as any).__LAST_ACTION__;

          (window as any).__REDUX_MONITOR__.history.push({
            action: action?.type || 'UNKNOWN',
            prevState: JSON.parse(JSON.stringify(prevState)),
            nextState: JSON.parse(JSON.stringify(nextState)),
            timestamp: Date.now()
          });

          prevState = nextState;
        });

        // Patch dispatch to capture actions
        const originalDispatch = store.dispatch;
        store.dispatch = (action: any) => {
          (window as any).__LAST_ACTION__ = action;
          (window as any).__REDUX_MONITOR__.actions.push({
            ...action,
            timestamp: Date.now()
          });
          return originalDispatch(action);
        };
      }
    }, 100);
  });

  return {
    current: {},
    history: [],
    actions: []
  };
}

async function getReduxState(page: Page): Promise<ReduxState> {
  return await page.evaluate(() => {
    const store = (window as any).__REDUX_STORE__ ||
      (window as any).store;

    return {
      current: store?.getState() || {},
      history: (window as any).__REDUX_MONITOR__?.history || [],
      actions: (window as any).__REDUX_MONITOR__?.actions || []
    };
  });
}

async function dispatchAction(
  page: Page,
  action: { type: string; payload?: any }
): Promise<void> {
  await page.evaluate((act) => {
    const store = (window as any).__REDUX_STORE__ ||
      (window as any).store;
    if (store) {
      store.dispatch(act);
    }
  }, action);
}
```

### React Component State Inspection

```typescript
// state-debugger/react-inspector.ts
import { Page } from '@playwright/test';

interface ComponentState {
  name: string;
  props: Record<string, any>;
  state: Record<string, any>;
  hooks: HookState[];
  context: Record<string, any>;
  children: ComponentState[];
}

interface HookState {
  type: 'useState' | 'useReducer' | 'useContext' | 'useMemo' | 'useRef' | 'useEffect';
  value: any;
  index: number;
}

async function inspectReactComponent(
  page: Page,
  selector: string
): Promise<ComponentState | null> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;

    // Find React fiber
    const fiberKey = Object.keys(element).find(
      key => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
    );

    if (!fiberKey) return null;

    const fiber = (element as any)[fiberKey];

    function extractComponentInfo(fiber: any): ComponentState {
      const type = fiber.type;
      const name = type?.displayName || type?.name || 'Unknown';

      // Extract props
      const props = fiber.memoizedProps || {};

      // Extract state from hooks
      const hooks: HookState[] = [];
      let hookFiber = fiber.memoizedState;
      let hookIndex = 0;

      while (hookFiber) {
        if (hookFiber.memoizedState !== undefined) {
          hooks.push({
            type: inferHookType(hookFiber),
            value: hookFiber.memoizedState,
            index: hookIndex
          });
        }
        hookFiber = hookFiber.next;
        hookIndex++;
      }

      // Extract context
      const context: Record<string, any> = {};
      let contextFiber = fiber.dependencies?.firstContext;
      while (contextFiber) {
        const contextType = contextFiber.context;
        const contextName = contextType?.displayName || 'Context';
        context[contextName] = contextFiber.memoizedValue;
        contextFiber = contextFiber.next;
      }

      return {
        name,
        props: sanitizeForJSON(props),
        state: {},
        hooks,
        context,
        children: []
      };
    }

    function inferHookType(hookFiber: any): HookState['type'] {
      if (hookFiber.queue) return 'useState';
      if (hookFiber.deps) return 'useEffect';
      return 'useState';
    }

    function sanitizeForJSON(obj: any): any {
      try {
        return JSON.parse(JSON.stringify(obj, (key, value) => {
          if (typeof value === 'function') return '[Function]';
          if (value instanceof HTMLElement) return '[HTMLElement]';
          return value;
        }));
      } catch {
        return '[Circular]';
      }
    }

    return extractComponentInfo(fiber);
  }, selector);
}

async function getReactTree(page: Page): Promise<ComponentState[]> {
  return await page.evaluate(() => {
    const roots: ComponentState[] = [];

    // Find all React roots
    document.querySelectorAll('[data-reactroot], #root, #app').forEach(root => {
      const fiberKey = Object.keys(root).find(
        key => key.startsWith('__reactContainer$')
      );

      if (fiberKey) {
        const container = (root as any)[fiberKey];
        // Traverse fiber tree
        // ... (implementation similar to above)
      }
    });

    return roots;
  });
}
```

### Zustand/Jotai State Monitoring

```typescript
// state-debugger/zustand-monitor.ts
import { Page } from '@playwright/test';

interface ZustandState {
  stores: Map<string, StoreState>;
  subscriptions: Subscription[];
}

interface StoreState {
  name: string;
  state: Record<string, any>;
  actions: string[];
  history: StateChange[];
}

async function monitorZustandStores(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__ZUSTAND_MONITOR__ = {
      stores: new Map(),
      subscriptions: []
    };

    // Patch Zustand create function
    const originalCreate = (window as any).zustand?.create;
    if (originalCreate) {
      (window as any).zustand.create = (createState: any) => {
        const store = originalCreate(createState);

        // Extract store name from stack trace or use index
        const storeName = `Store_${(window as any).__ZUSTAND_MONITOR__.stores.size}`;

        const storeData = {
          name: storeName,
          state: store.getState(),
          actions: Object.keys(store.getState()).filter(
            key => typeof store.getState()[key] === 'function'
          ),
          history: []
        };

        // Subscribe to changes
        store.subscribe((state: any, prevState: any) => {
          storeData.history.push({
            prevState,
            nextState: state,
            timestamp: Date.now()
          });
          storeData.state = state;
        });

        (window as any).__ZUSTAND_MONITOR__.stores.set(storeName, storeData);

        return store;
      };
    }
  });
}

async function getZustandState(page: Page): Promise<Map<string, StoreState>> {
  const storesData = await page.evaluate(() => {
    const stores = (window as any).__ZUSTAND_MONITOR__?.stores;
    if (!stores) return [];

    return Array.from(stores.entries()).map(([name, data]: [string, any]) => ({
      name,
      state: data.state,
      actions: data.actions,
      historyLength: data.history.length
    }));
  });

  const result = new Map<string, StoreState>();
  for (const store of storesData) {
    result.set(store.name, store as StoreState);
  }
  return result;
}
```

## State Issue Detection

### Stale Closure Detection

```typescript
// state-debugger/stale-closure-detector.ts
import { Page } from '@playwright/test';

interface StaleClosureIssue {
  component: string;
  hookIndex: number;
  closedOverValue: any;
  currentValue: any;
  location: string;
}

async function detectStaleClosures(page: Page): Promise<StaleClosureIssue[]> {
  return await page.evaluate(() => {
    const issues: StaleClosureIssue[] = [];

    // Find all useEffect/useCallback/useMemo hooks
    // Check if dependencies array is missing values that are used

    // This requires React DevTools integration
    const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!devTools) return issues;

    // Traverse all fibers and check hooks
    // ... implementation

    return issues;
  });
}

async function checkDependencyArrays(page: Page): Promise<DependencyIssue[]> {
  return await page.evaluate(() => {
    const issues: DependencyIssue[] = [];

    // Analyze useEffect, useMemo, useCallback dependency arrays
    // Flag missing dependencies or unnecessary dependencies

    return issues;
  });
}
```

### State Synchronization Issues

```typescript
// state-debugger/sync-detector.ts
import { Page } from '@playwright/test';

interface SyncIssue {
  type: 'race-condition' | 'stale-state' | 'conflicting-updates' | 'missing-update';
  description: string;
  evidence: any;
  suggestion: string;
}

async function detectSyncIssues(
  page: Page,
  duration: number = 5000
): Promise<SyncIssue[]> {
  const issues: SyncIssue[] = [];

  // Monitor state changes
  const stateLog = await page.evaluate((dur) => {
    return new Promise<StateChange[]>((resolve) => {
      const changes: StateChange[] = [];

      // Set up monitoring
      const observer = new MutationObserver(() => {
        // Track DOM changes that might indicate state updates
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(changes);
      }, dur);
    });
  }, duration);

  // Analyze for sync issues

  // Check for rapid consecutive updates (possible race condition)
  const rapidUpdates = findRapidUpdates(stateLog);
  if (rapidUpdates.length > 0) {
    issues.push({
      type: 'race-condition',
      description: `${rapidUpdates.length} rapid state updates detected`,
      evidence: rapidUpdates,
      suggestion: 'Consider debouncing updates or using useTransition'
    });
  }

  // Check for state that doesn't match DOM
  const staleState = await detectStaleStateInDOM(page);
  if (staleState.length > 0) {
    issues.push({
      type: 'stale-state',
      description: 'DOM does not reflect current state',
      evidence: staleState,
      suggestion: 'Check for missing re-renders or stale closures'
    });
  }

  return issues;
}

function findRapidUpdates(changes: StateChange[]): StateChange[][] {
  const groups: StateChange[][] = [];
  let currentGroup: StateChange[] = [];

  for (let i = 0; i < changes.length; i++) {
    if (i === 0) {
      currentGroup.push(changes[i]);
      continue;
    }

    const timeDiff = changes[i].timestamp - changes[i - 1].timestamp;
    if (timeDiff < 16) { // Less than one frame
      currentGroup.push(changes[i]);
    } else {
      if (currentGroup.length > 3) {
        groups.push(currentGroup);
      }
      currentGroup = [changes[i]];
    }
  }

  return groups;
}
```

### Context Provider Issues

```typescript
// state-debugger/context-debugger.ts
import { Page } from '@playwright/test';

interface ContextIssue {
  type: 'missing-provider' | 'wrong-value' | 'excessive-rerenders' | 'deep-nesting';
  context: string;
  description: string;
  affectedComponents: string[];
}

async function analyzeContextUsage(page: Page): Promise<ContextIssue[]> {
  return await page.evaluate(() => {
    const issues: ContextIssue[] = [];

    // Find all context providers and consumers
    // Check for:
    // 1. Consumers without providers
    // 2. Providers with frequently changing values
    // 3. Deep context nesting
    // 4. Large context values causing rerenders

    const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!devTools) return issues;

    // Traverse component tree
    // ... implementation

    return issues;
  });
}

async function measureContextRerenders(
  page: Page,
  contextName: string,
  duration: number = 5000
): Promise<RerenderMetrics> {
  return await page.evaluate(async (name, dur) => {
    const rerenders: number[] = [];
    const affectedComponents = new Set<string>();

    // Monitor rerenders caused by context changes
    // ... implementation

    return {
      contextName: name,
      rerenderCount: rerenders.length,
      affectedComponents: Array.from(affectedComponents),
      averageRerenderTime: rerenders.reduce((a, b) => a + b, 0) / rerenders.length
    };
  }, contextName, duration);
}
```

## AI-Powered State Analysis

### Intelligent State Debugging

```typescript
// state-debugger/ai-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';

interface StateAnalysis {
  issues: StateIssue[];
  dataFlowDiagram: string;
  recommendations: string[];
  codeExamples: CodeFix[];
}

async function analyzeStateIssue(
  description: string,
  stateHistory: StateChange[],
  componentTree: ComponentState
): Promise<StateAnalysis> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `Debug this state management issue:

## Problem Description
${description}

## State History (last 10 changes)
${stateHistory.slice(-10).map(change => `
Action: ${change.action}
Before: ${JSON.stringify(change.prevState, null, 2)}
After: ${JSON.stringify(change.nextState, null, 2)}
Time: ${new Date(change.timestamp).toISOString()}
`).join('\n---\n')}

## Component Tree
${JSON.stringify(componentTree, null, 2)}

Analyze and provide:
1. Root cause of the state issue
2. Data flow diagram showing the problem
3. Specific code fixes
4. Best practices to prevent similar issues

Focus on:
- State update patterns
- Component re-render triggers
- Data synchronization
- Side effect management`
    }]
  });

  return parseStateAnalysisResponse(response);
}

async function suggestStateRefactoring(
  currentState: Record<string, any>,
  usagePatterns: UsagePattern[]
): Promise<RefactoringPlan> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Suggest state management improvements:

## Current State Structure
${JSON.stringify(currentState, null, 2)}

## Usage Patterns
${usagePatterns.map(p => `- ${p.action}: ${p.frequency} times, avg ${p.avgDuration}ms`).join('\n')}

Suggest:
1. State normalization improvements
2. Selector optimizations
3. State splitting recommendations
4. Caching strategies
5. Code examples for top 3 improvements`
    }]
  });

  return parseRefactoringResponse(response);
}
```

## State Testing Utilities

### State Snapshot Testing

```typescript
// state-debugger/snapshot-testing.ts
import { test, expect } from '@playwright/test';

interface StateSnapshot {
  name: string;
  state: Record<string, any>;
  timestamp: number;
}

async function takeStateSnapshot(
  page: Page,
  name: string
): Promise<StateSnapshot> {
  const state = await page.evaluate(() => {
    // Get all state sources
    const redux = (window as any).__REDUX_STORE__?.getState();
    const zustand = Array.from(
      (window as any).__ZUSTAND_MONITOR__?.stores?.values() || []
    ).reduce((acc: any, store: any) => {
      acc[store.name] = store.state;
      return acc;
    }, {});

    return {
      redux,
      zustand,
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage }
    };
  });

  return {
    name,
    state,
    timestamp: Date.now()
  };
}

test('state transitions correctly', async ({ page }) => {
  await page.goto('/app');

  // Take initial snapshot
  const initial = await takeStateSnapshot(page, 'initial');

  // Perform action
  await page.click('[data-testid="add-item"]');

  // Take after snapshot
  const after = await takeStateSnapshot(page, 'after-add');

  // Assert state changes
  expect(after.state.redux.items.length).toBe(
    initial.state.redux.items.length + 1
  );
});
```

### State Time Travel

```typescript
// state-debugger/time-travel.ts
import { Page } from '@playwright/test';

async function timeTravel(
  page: Page,
  targetIndex: number
): Promise<void> {
  await page.evaluate((index) => {
    const history = (window as any).__REDUX_MONITOR__?.history;
    if (!history || index >= history.length) return;

    const targetState = history[index].nextState;
    const store = (window as any).__REDUX_STORE__;

    if (store) {
      // Replace state
      store.dispatch({
        type: '@@TIMETRAVEL',
        payload: targetState
      });
    }
  }, targetIndex);
}

async function replayActions(
  page: Page,
  fromIndex: number,
  toIndex: number,
  speed: number = 1
): Promise<void> {
  const actions = await page.evaluate(() => {
    return (window as any).__REDUX_MONITOR__?.actions || [];
  });

  for (let i = fromIndex; i <= toIndex; i++) {
    const action = actions[i];
    if (action) {
      await page.evaluate((act) => {
        (window as any).__REDUX_STORE__?.dispatch(act);
      }, action);

      await page.waitForTimeout(100 / speed);
    }
  }
}
```

## Deliverables

### State Debug Report Template

```markdown
# State Debug Report

## Issue Summary
**Type:** [Stale State/Sync Issue/Race Condition/Missing Update]
**Affected Components:** [List]
**State Slice:** [Which part of state]

## State Timeline

| Time | Action | State Change |
|------|--------|--------------|
| 0ms | FETCH_START | loading: true |
| 50ms | FETCH_SUCCESS | loading: false, data: [...] |
| 51ms | FETCH_START | loading: true ← Unexpected! |

## Root Cause
[Explanation of why the state issue occurs]

## Data Flow Diagram
```
User Click → dispatch(FETCH_START) → API Call
                                    ↓
                            dispatch(FETCH_SUCCESS)
                                    ↓
                   ← Component didn't re-subscribe →
                                    ↓
                        Stale data displayed
```

## Fix Implementation

### Before (Problematic)
```typescript
useEffect(() => {
  fetchData();
}, []); // Missing dependency
```

### After (Fixed)
```typescript
useEffect(() => {
  fetchData(userId);
}, [userId]); // Properly reacts to userId changes
```

## Prevention Checklist
- [ ] Add ESLint rule for exhaustive-deps
- [ ] Use state selectors for derived data
- [ ] Implement optimistic updates correctly
- [ ] Add state transition tests
```

## Usage Prompts

### State Issue Investigation
```
Investigate why the user data is stale after login:
1. Monitor Redux state changes during login flow
2. Track component subscriptions
3. Identify where state gets out of sync
4. Provide specific fix
```

### State Architecture Review
```
Review state management in this app:
1. Analyze current state structure
2. Identify redundant or denormalized data
3. Check for performance issues from state shape
4. Recommend improvements with code examples
```

### Context Performance Analysis
```
Analyze context usage causing re-renders:
1. Measure re-renders from context changes
2. Identify which components are affected
3. Suggest context splitting or memoization
4. Provide optimized implementation
```
