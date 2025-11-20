'use client';

import { useState } from 'react';
import { ArrowLeft, Rocket, Github, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ProjectForm {
  name: string;
  description: string;
  problemStatement: string;
  targetUsers: string;
  keyFeatures: string;
  techStack: string;
  timeline: string;
  additionalNotes: string;
  createGithubRepo: boolean;
  repoVisibility: 'public' | 'private';
}

interface GenerationStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
}

export default function GenerateProjectPage() {
  const [form, setForm] = useState<ProjectForm>({
    name: '',
    description: '',
    problemStatement: '',
    targetUsers: '',
    keyFeatures: '',
    techStack: '',
    timeline: '',
    additionalNotes: '',
    createGithubRepo: true,
    repoVisibility: 'private',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [result, setResult] = useState<{ repoUrl?: string; localPath?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setResult(null);

    const initialSteps: GenerationStep[] = [
      { name: 'Validating project details', status: 'pending' },
      { name: 'Generating project structure', status: 'pending' },
      { name: 'Creating PROJECT_BRIEF.md', status: 'pending' },
      { name: 'Setting up AI agents', status: 'pending' },
      { name: 'Generating README.md', status: 'pending' },
      ...(form.createGithubRepo
        ? [
            { name: 'Creating GitHub repository', status: 'pending' as const },
            { name: 'Pushing initial commit', status: 'pending' as const },
          ]
        : []),
    ];

    setSteps(initialSteps);

    try {
      const response = await fetch('http://localhost:4000/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project');
      }

      // Simulate step progression (in real implementation, use SSE or WebSocket)
      for (let i = 0; i < initialSteps.length; i++) {
        setSteps((prev) =>
          prev.map((step, idx) => ({
            ...step,
            status: idx === i ? 'in_progress' : idx < i ? 'completed' : 'pending',
          }))
        );
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const data = await response.json();

      setSteps((prev) => prev.map((step) => ({ ...step, status: 'completed' })));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: step.status === 'in_progress' ? 'error' : step.status,
        }))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Rocket className="w-8 h-8 text-blue-600" />
            Generate New Project
          </h1>
          <p className="text-slate-600 mt-2">
            Describe your project and we'll generate a complete repository with AI agents ready to
            help you build it.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="my-awesome-saas"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Short Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  placeholder="A tool that helps users compare health insurance plans"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Problem & Users */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Problem & Users</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="problemStatement"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Problem Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="problemStatement"
                  name="problemStatement"
                  value={form.problemStatement}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe the problem you're solving. What pain point exists? Why does it matter?"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="targetUsers"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Target Users <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="targetUsers"
                  name="targetUsers"
                  value={form.targetUsers}
                  onChange={handleChange}
                  required
                  rows={2}
                  placeholder="Who will use this? e.g., 'Families comparing health insurance during open enrollment'"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Features & Tech */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Features & Technology</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="keyFeatures"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Key Features <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="keyFeatures"
                  name="keyFeatures"
                  value={form.keyFeatures}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="List the main features, one per line:
- Compare multiple insurance plans
- Monte Carlo cost simulation
- Risk-adjusted recommendations
- Export results to PDF"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label htmlFor="techStack" className="block text-sm font-medium text-slate-700 mb-1">
                  Preferred Tech Stack
                </label>
                <input
                  type="text"
                  id="techStack"
                  name="techStack"
                  value={form.techStack}
                  onChange={handleChange}
                  placeholder="e.g., Python, Next.js, PostgreSQL, Vercel"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="timeline" className="block text-sm font-medium text-slate-700 mb-1">
                  Timeline
                </label>
                <input
                  type="text"
                  id="timeline"
                  name="timeline"
                  value={form.timeline}
                  onChange={handleChange}
                  placeholder="e.g., MVP in 2 weeks, full version in 1 month"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Context</h2>

            <div>
              <label
                htmlFor="additionalNotes"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={form.additionalNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Any other context, constraints, inspiration, or requirements..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* GitHub Options */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Repository
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="createGithubRepo"
                  checked={form.createGithubRepo}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Create GitHub repository automatically</span>
              </label>

              {form.createGithubRepo && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Repository Visibility
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="repoVisibility"
                        value="private"
                        checked={form.repoVisibility === 'private'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Private</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="repoVisibility"
                        value="public"
                        checked={form.repoVisibility === 'public'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Public</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Project...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Generate Project
              </>
            )}
          </button>
        </form>

        {/* Progress Steps */}
        {steps.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Generation Progress</h2>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  {step.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {step.status === 'in_progress' && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {step.status === 'pending' && (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                  {step.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  <span
                    className={`text-sm ${
                      step.status === 'completed'
                        ? 'text-green-700'
                        : step.status === 'in_progress'
                          ? 'text-blue-700 font-medium'
                          : step.status === 'error'
                            ? 'text-red-700'
                            : 'text-slate-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Generation Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-lg font-semibold text-green-800">Project Generated Successfully!</p>
                <div className="mt-3 space-y-2">
                  {result.localPath && (
                    <p className="text-sm text-green-700">
                      <strong>Local Path:</strong>{' '}
                      <code className="bg-green-100 px-2 py-0.5 rounded">{result.localPath}</code>
                    </p>
                  )}
                  {result.repoUrl && (
                    <p className="text-sm text-green-700">
                      <strong>GitHub Repo:</strong>{' '}
                      <a
                        href={result.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-800 underline hover:text-green-900"
                      >
                        {result.repoUrl}
                      </a>
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-green-700 font-medium">Next Steps:</p>
                  <ol className="text-sm text-green-700 mt-2 list-decimal list-inside space-y-1">
                    <li>Open the project in your editor</li>
                    <li>Review the generated PROJECT_BRIEF.md</li>
                    <li>Start with agents/agent-0-orchestrator.md</li>
                    <li>Begin building with AI agent guidance!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
