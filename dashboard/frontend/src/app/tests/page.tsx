'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestRunner } from '@/components/tests/TestRunner';

// Agent categories and their colors
const AGENT_CATEGORIES: Record<string, { name: string; color: string; agents: number[] }> = {
  core: { name: 'Core Development', color: 'primary', agents: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  debug: { name: 'Debug Suite', color: 'warning', agents: [10, 11, 12, 13, 14, 15, 16] },
  review: { name: 'Review & Specialized', color: 'success', agents: [17, 18, 19, 20] },
  ds: { name: 'Data Science', color: 'destructive', agents: [21, 22, 23, 24, 25, 26, 27] },
};

// Agent names mapping
const AGENT_NAMES: Record<number, string> = {
  0: 'Orchestrator',
  1: 'Problem Framer',
  2: 'Competitive Mapper',
  3: 'Product Manager',
  4: 'UX Designer',
  5: 'System Architect',
  6: 'Engineer',
  7: 'QA Test Engineer',
  8: 'DevOps',
  9: 'Analytics',
  10: 'Debug Detective',
  11: 'Visual Debug Specialist',
  12: 'Performance Profiler',
  13: 'Network Inspector',
  14: 'State Debugger',
  15: 'Error Tracker',
  16: 'Memory Leak Hunter',
  17: 'Security Auditor',
  18: 'Code Reviewer',
  19: 'Database Engineer',
  20: 'Design Reviewer',
  21: 'Data Scientist Lead',
  22: 'Data Explorer',
  23: 'Feature Engineer',
  24: 'Model Architect',
  25: 'ML Engineer',
  26: 'Model Evaluator',
  27: 'MLOps Engineer',
};

interface Scenario {
  id: string;
  name: string;
  description: string;
  evaluationCriteria?: Record<string, { weight: number; checks: string[] }>;
}

interface EdgeCase {
  id: string;
  name: string;
  description: string;
  expectedBehavior: string;
  guardrailCheck?: boolean;
}

interface TestScenario {
  agentId: number;
  agentName: string;
  scenarios: Scenario[];
  edgeCases: EdgeCase[];
  guardrails?: {
    mustNotContain: string[];
    mustAlwaysDo: string[];
    principles: string[];
  };
  codeTemplates?: {
    python: string[];
    r?: string[];
  };
}

// Test scenarios data (loaded from JSON files)
const TEST_SCENARIOS: TestScenario[] = [
  {
    agentId: 22,
    agentName: 'Data Explorer',
    scenarios: [
      { id: 'de-001', name: 'Binary Classification EDA', description: 'Analyze fraud detection dataset with class imbalance' },
      { id: 'de-002', name: 'Missing Data Analysis', description: 'Comprehensive missing value analysis' },
      { id: 'de-003', name: 'Time Series EDA', description: 'Sales forecasting data exploration' },
      { id: 'de-004', name: 'Multi-Class Classification', description: 'Customer segment analysis' },
      { id: 'de-005', name: 'Text Data Exploration', description: 'Product review sentiment analysis' },
    ],
    edgeCases: [
      { id: 'de-edge-001', name: 'No Dataset', description: 'Handle request without data', expectedBehavior: 'Request data before analysis' },
      { id: 'de-edge-002', name: 'Extreme Imbalance', description: '0.01% positive class', expectedBehavior: 'Flag and suggest strategies' },
      { id: 'de-edge-003', name: 'High Cardinality', description: '100K unique categories', expectedBehavior: 'Warn about encoding issues' },
      { id: 'de-edge-004', name: 'Data Leakage Risk', description: 'Features derived from target', expectedBehavior: 'Detect and warn about leakage' },
    ],
    codeTemplates: { python: ['pandas', 'numpy', 'matplotlib', 'seaborn'], r: ['tidyverse', 'skimr', 'DataExplorer'] },
  },
  {
    agentId: 23,
    agentName: 'Feature Engineer',
    scenarios: [
      { id: 'fe-001', name: 'Numeric Feature Engineering', description: 'Transformations for house price prediction' },
      { id: 'fe-002', name: 'Categorical Encoding', description: 'Handle various categorical types for churn model' },
      { id: 'fe-003', name: 'Time-Based Features', description: 'Temporal features for sales forecasting' },
      { id: 'fe-004', name: 'Text Feature Engineering', description: 'Extract features from product reviews' },
      { id: 'fe-005', name: 'Feature Selection', description: 'Select from 200 engineered features' },
    ],
    edgeCases: [
      { id: 'fe-edge-001', name: 'No EDA Report', description: 'Request without prior EDA', expectedBehavior: 'Request EDA findings first' },
      { id: 'fe-edge-002', name: 'Target Leakage Risk', description: 'Days until churn feature', expectedBehavior: 'Refuse leaky feature' },
      { id: 'fe-edge-003', name: 'Memory Constraints', description: 'One-hot 100K categories', expectedBehavior: 'Warn and suggest alternatives' },
      { id: 'fe-edge-004', name: 'Missing Target', description: 'Unsupervised engineering', expectedBehavior: 'Adapt to no-target strategy' },
    ],
    codeTemplates: { python: ['sklearn', 'category_encoders', 'feature_engine'], r: ['recipes', 'tidymodels'] },
  },
  {
    agentId: 24,
    agentName: 'Model Architect',
    scenarios: [
      { id: 'ma-001', name: 'Binary Classification', description: 'Fraud detection model selection' },
      { id: 'ma-002', name: 'Regression Architecture', description: 'House price prediction model design' },
      { id: 'ma-003', name: 'Time Series Forecasting', description: 'Daily sales forecasting architecture' },
      { id: 'ma-004', name: 'Multi-Class Classification', description: 'Customer segment prediction' },
      { id: 'ma-005', name: 'Deep Learning Architecture', description: 'CNN for image classification' },
    ],
    edgeCases: [
      { id: 'ma-edge-001', name: 'Insufficient Data', description: '500 samples, 100 features', expectedBehavior: 'Warn about overfitting' },
      { id: 'ma-edge-002', name: 'Conflicting Requirements', description: 'Accuracy + interpretability + speed', expectedBehavior: 'Flag tradeoffs' },
      { id: 'ma-edge-003', name: 'No Feature Engineering', description: 'Raw CSV data', expectedBehavior: 'Request preprocessing first' },
      { id: 'ma-edge-004', name: 'Unrealistic Target', description: '99.99% accuracy on noisy data', expectedBehavior: 'Set realistic expectations' },
    ],
    codeTemplates: { python: ['sklearn', 'xgboost', 'lightgbm', 'pytorch'], r: ['parsnip', 'tidymodels'] },
  },
  {
    agentId: 25,
    agentName: 'ML Engineer',
    scenarios: [
      { id: 'mle-001', name: 'XGBoost Training', description: 'Implement gradient boosting for churn' },
      { id: 'mle-002', name: 'Deep Learning Training', description: 'PyTorch training loop for images' },
      { id: 'mle-003', name: 'Distributed Training', description: 'Multi-GPU training setup' },
      { id: 'mle-004', name: 'Hyperparameter Optimization', description: 'Optuna-based HPO for LightGBM' },
      { id: 'mle-005', name: 'Ensemble Training', description: 'Stacking ensemble implementation' },
    ],
    edgeCases: [
      { id: 'mle-edge-001', name: 'Missing Architecture', description: 'Train without spec', expectedBehavior: 'Request architecture doc' },
      { id: 'mle-edge-002', name: 'GPU OOM', description: 'ResNet152 batch=256 on 8GB', expectedBehavior: 'Suggest gradient accumulation' },
      { id: 'mle-edge-003', name: 'Overfitting Detection', description: '99% train, 60% val', expectedBehavior: 'Diagnose and remediate' },
      { id: 'mle-edge-004', name: 'NaN Loss', description: 'Training divergence', expectedBehavior: 'Suggest LR, clipping, normalization' },
    ],
    codeTemplates: { python: ['sklearn', 'xgboost', 'pytorch', 'optuna'], r: ['tidymodels', 'mlr3'] },
  },
  {
    agentId: 26,
    agentName: 'Model Evaluator',
    scenarios: [
      { id: 'me-001', name: 'Binary Classification Evaluation', description: 'Fraud model evaluation with threshold optimization' },
      { id: 'me-002', name: 'Regression Evaluation', description: 'House price model residual analysis' },
      { id: 'me-003', name: 'Fairness Evaluation', description: 'Loan approval model bias assessment' },
      { id: 'me-004', name: 'Model Interpretability', description: 'SHAP analysis for credit scoring' },
      { id: 'me-005', name: 'Cross-Validation Analysis', description: 'CV stability assessment' },
    ],
    edgeCases: [
      { id: 'me-edge-001', name: 'No Test Set', description: 'Evaluate on training data', expectedBehavior: 'Refuse or strongly warn' },
      { id: 'me-edge-002', name: 'Perfect Metrics', description: '100% accuracy', expectedBehavior: 'Flag potential leakage' },
      { id: 'me-edge-003', name: 'Missing Demographics', description: 'Fairness without protected attrs', expectedBehavior: 'Explain limitations' },
      { id: 'me-edge-004', name: 'Wrong Metric Focus', description: 'Accuracy on 99:1 data', expectedBehavior: 'Redirect to PR-AUC' },
    ],
    codeTemplates: { python: ['sklearn.metrics', 'shap', 'fairlearn'], r: ['yardstick', 'DALEX'] },
  },
  {
    agentId: 27,
    agentName: 'MLOps Engineer',
    scenarios: [
      { id: 'mlops-001', name: 'Model Deployment', description: 'REST API for XGBoost on Kubernetes' },
      { id: 'mlops-002', name: 'CI/CD Pipeline', description: 'GitHub Actions for ML pipeline' },
      { id: 'mlops-003', name: 'Model Monitoring', description: 'Drift detection and alerting setup' },
      { id: 'mlops-004', name: 'A/B Testing Infrastructure', description: 'Experiment framework for models' },
      { id: 'mlops-005', name: 'Retraining Pipeline', description: 'Automated retrain on drift' },
    ],
    edgeCases: [
      { id: 'mlops-edge-001', name: 'No Evaluation Report', description: 'Deploy without validation', expectedBehavior: 'Request evaluation first' },
      { id: 'mlops-edge-002', name: 'Friday Deployment', description: 'Deploy Friday 5pm', expectedBehavior: 'Warn against timing' },
      { id: 'mlops-edge-003', name: 'No Rollback Plan', description: 'Replace without backup', expectedBehavior: 'Require rollback strategy' },
      { id: 'mlops-edge-004', name: 'No Monitoring', description: 'Deploy without monitoring', expectedBehavior: 'Refuse without monitoring' },
    ],
    codeTemplates: { python: ['fastapi', 'mlflow', 'prometheus_client'], r: ['plumber', 'vetiver'] },
  },
];

function getAgentCategory(agentId: number): string | null {
  for (const [key, category] of Object.entries(AGENT_CATEGORIES)) {
    if (category.agents.includes(agentId)) {
      return key;
    }
  }
  return null;
}

export default function TestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<TestScenario | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  const filteredScenarios = selectedCategory
    ? TEST_SCENARIOS.filter((ts) => getAgentCategory(ts.agentId) === selectedCategory)
    : TEST_SCENARIOS;

  const totalScenarios = TEST_SCENARIOS.reduce((acc, ts) => acc + ts.scenarios.length, 0);
  const totalEdgeCases = TEST_SCENARIOS.reduce((acc, ts) => acc + ts.edgeCases.length, 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Agent Test Scenarios</h1>
            <p className="mt-2 text-slate-600">
              Comprehensive test coverage for {TEST_SCENARIOS.length} Data Science agents
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-white rounded-lg border border-slate-200">
              <div className="text-2xl font-bold text-blue-600">{totalScenarios}</div>
              <div className="text-xs text-slate-500">Scenarios</div>
            </div>
            <div className="text-center px-4 py-2 bg-white rounded-lg border border-slate-200">
              <div className="text-2xl font-bold text-amber-600">{totalEdgeCases}</div>
              <div className="text-xs text-slate-500">Edge Cases</div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Agents
          </Button>
          {Object.entries(AGENT_CATEGORIES).map(([key, category]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Agents with Tests</h2>
            {filteredScenarios.map((testScenario) => {
              const category = getAgentCategory(testScenario.agentId);
              const categoryConfig = category ? AGENT_CATEGORIES[category] : null;

              return (
                <Card
                  key={testScenario.agentId}
                  hoverable
                  clickable
                  className={selectedAgent?.agentId === testScenario.agentId ? 'ring-2 ring-blue-500' : ''}
                  onClick={() => setSelectedAgent(testScenario)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            Agent {testScenario.agentId}
                          </span>
                          {categoryConfig && (
                            <Badge variant={categoryConfig.color as 'primary' | 'warning' | 'success' | 'destructive'}>
                              {categoryConfig.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{testScenario.agentName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {testScenario.scenarios.length} tests
                        </div>
                        <div className="text-xs text-slate-500">
                          {testScenario.edgeCases.length} edge cases
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Scenario Details */}
          <div className="lg:col-span-2">
            {selectedAgent ? (
              <div className="space-y-6">
                {/* Test Runner */}
                <TestRunner
                  agentId={selectedAgent.agentId}
                  agentName={selectedAgent.agentName}
                  scenarios={selectedAgent.scenarios}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Agent {selectedAgent.agentId}: {selectedAgent.agentName}
                    </CardTitle>
                    <CardDescription>
                      {selectedAgent.scenarios.length} scenarios, {selectedAgent.edgeCases.length} edge cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Code Templates */}
                    {selectedAgent.codeTemplates && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Supported Libraries</h4>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="primary">Python</Badge>
                            {selectedAgent.codeTemplates.python.map((lib) => (
                              <span key={lib} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {lib}
                              </span>
                            ))}
                          </div>
                          {selectedAgent.codeTemplates.r && (
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="success">R</Badge>
                              {selectedAgent.codeTemplates.r.map((lib) => (
                                <span key={lib} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                  {lib}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Test Scenarios */}
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Test Scenarios</h4>
                    <div className="space-y-3">
                      {selectedAgent.scenarios.map((scenario) => (
                        <div
                          key={scenario.id}
                          className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                          onClick={() => setExpandedScenario(expandedScenario === scenario.id ? null : scenario.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{scenario.id}</Badge>
                                <span className="font-medium text-slate-900">{scenario.name}</span>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{scenario.description}</p>
                            </div>
                            <svg
                              className={`h-5 w-5 text-slate-400 transition-transform ${
                                expandedScenario === scenario.id ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {expandedScenario === scenario.id && scenario.evaluationCriteria && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <h5 className="text-sm font-medium text-slate-700 mb-2">Evaluation Criteria</h5>
                              <div className="space-y-2">
                                {Object.entries(scenario.evaluationCriteria).map(([key, criteria]) => (
                                  <div key={key} className="text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                      <span className="text-slate-500">{Math.round(criteria.weight * 100)}%</span>
                                    </div>
                                    <ul className="mt-1 ml-4 list-disc text-xs text-slate-500">
                                      {criteria.checks.map((check, i) => (
                                        <li key={i}>{check}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Edge Cases */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Edge Cases & Guardrails</CardTitle>
                    <CardDescription>
                      Tests for boundary conditions and safety checks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedAgent.edgeCases.map((edgeCase) => (
                        <div
                          key={edgeCase.id}
                          className="border border-amber-200 bg-amber-50 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="warning">{edgeCase.id}</Badge>
                            <span className="font-medium text-slate-900">{edgeCase.name}</span>
                            {edgeCase.guardrailCheck && (
                              <Badge variant="destructive">Guardrail</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{edgeCase.description}</p>
                          <div className="text-sm">
                            <span className="font-medium text-slate-700">Expected: </span>
                            <span className="text-slate-600">{edgeCase.expectedBehavior}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-slate-200">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <p className="mt-2 text-slate-600">Select an agent to view test scenarios</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
