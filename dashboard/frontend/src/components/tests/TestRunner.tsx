'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';

interface TestResult {
  scenarioId: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  message?: string;
  checks?: {
    name: string;
    passed: boolean;
  }[];
}

interface TestRunnerProps {
  agentId: number;
  agentName: string;
  scenarios: {
    id: string;
    name: string;
    description: string;
  }[];
  onRunComplete?: (results: TestResult[]) => void;
}

export function TestRunner({ agentId, agentName, scenarios, onRunComplete }: TestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  async function runTests() {
    setIsRunning(true);
    const newResults: TestResult[] = [];

    for (const scenario of scenarios) {
      // Set scenario to running
      setResults([...newResults, { scenarioId: scenario.id, status: 'running' }]);

      // Simulate test execution (replace with actual test runner)
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

      // Simulate test result
      const passed = Math.random() > 0.2; // 80% pass rate for demo
      const result: TestResult = {
        scenarioId: scenario.id,
        status: passed ? 'passed' : 'failed',
        duration: Math.round(100 + Math.random() * 400),
        message: passed ? 'All checks passed' : 'Some checks failed',
        checks: [
          { name: 'Output structure valid', passed: true },
          { name: 'Required elements present', passed },
          { name: 'No guardrail violations', passed: Math.random() > 0.1 },
          { name: 'Code quality check', passed: Math.random() > 0.3 },
        ],
      };

      newResults.push(result);
      setResults([...newResults]);
    }

    setIsRunning(false);
    onRunComplete?.(newResults);
  }

  function getResultForScenario(scenarioId: string): TestResult | undefined {
    return results.find((r) => r.scenarioId === scenarioId);
  }

  const passedCount = results.filter((r) => r.status === 'passed').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Test Runner: Agent {agentId}
          </CardTitle>
          <Button
            variant="primary"
            size="sm"
            onClick={runTests}
            disabled={isRunning}
            loading={isRunning}
          >
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>
        {results.length > 0 && (
          <div className="flex gap-2 mt-2">
            <Badge variant="success">{passedCount} Passed</Badge>
            <Badge variant="destructive">{failedCount} Failed</Badge>
            <Badge variant="default">{scenarios.length - passedCount - failedCount} Pending</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {scenarios.map((scenario) => {
            const result = getResultForScenario(scenario.id);

            return (
              <div
                key={scenario.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-colors',
                  result?.status === 'passed' && 'bg-green-50 border-green-200',
                  result?.status === 'failed' && 'bg-red-50 border-red-200',
                  result?.status === 'running' && 'bg-blue-50 border-blue-200',
                  !result && 'bg-slate-50 border-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      result?.status === 'passed' && 'bg-green-500',
                      result?.status === 'failed' && 'bg-red-500',
                      result?.status === 'running' && 'bg-blue-500 animate-pulse',
                      !result && 'bg-slate-300'
                    )}
                  />
                  <div>
                    <div className="font-medium text-sm text-slate-900">{scenario.name}</div>
                    <div className="text-xs text-slate-500">{scenario.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result?.duration && (
                    <span className="text-xs text-slate-500">{result.duration}ms</span>
                  )}
                  {result?.status === 'passed' && (
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {result?.status === 'failed' && (
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {result?.status === 'running' && (
                    <svg className="h-5 w-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed results for failed tests */}
        {results.filter((r) => r.status === 'failed').length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Failed Test Details</h4>
            {results
              .filter((r) => r.status === 'failed')
              .map((result) => (
                <div key={result.scenarioId} className="mb-3 p-3 bg-red-50 rounded-lg">
                  <div className="font-medium text-sm text-red-700">{result.scenarioId}</div>
                  {result.checks && (
                    <ul className="mt-2 space-y-1">
                      {result.checks.map((check, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          {check.passed ? (
                            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className={check.passed ? 'text-slate-600' : 'text-red-600'}>
                            {check.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
