'use client';

import { useEffect, useState } from 'react';
import { api, Project } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ProjectCardSkeleton } from '@/components/ui/skeleton';
import { ErrorState, InlineError } from '@/components/ui/error-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Toast, ToastContainer } from '@/components/ui/toast';

const STAGE_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  DISCOVER: 'primary',
  DESIGN: 'warning',
  BUILD: 'warning',
  TEST: 'warning',
  DEPLOY: 'success',
  ANALYZE: 'default',
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ show: boolean; variant: 'success' | 'error'; title: string; description?: string }>({
    show: false,
    variant: 'success',
    title: '',
  });

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    timeline: '',
    budget: '',
    techStack: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setError(null);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const errors: Record<string, string> = {};

    if (!newProject.name.trim()) {
      errors.name = 'Project name is required';
    } else if (newProject.name.length < 3) {
      errors.name = 'Project name must be at least 3 characters';
    }

    if (!newProject.description.trim()) {
      errors.description = 'Description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function createProject() {
    if (!validateForm()) {
      return;
    }

    try {
      setCreating(true);
      const constraints = JSON.stringify({
        timeline: newProject.timeline || 'Not specified',
        budget: newProject.budget || 'Not specified',
        techStack: newProject.techStack || 'Not specified',
      });

      await api.createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        constraints,
      });

      setShowNewProject(false);
      setNewProject({ name: '', description: '', timeline: '', budget: '', techStack: '' });
      setFormErrors({});

      showToast('success', 'Project created successfully', 'You can now start working with your agents');
      loadProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
      showToast('error', 'Failed to create project', 'Please try again or contact support');
    } finally {
      setCreating(false);
    }
  }

  function showToast(variant: 'success' | 'error', title: string, description?: string) {
    setToast({ show: true, variant, title, description });
    setTimeout(() => setToast({ show: false, variant: 'success', title: '' }), 5000);
  }

  function handleDialogClose() {
    if (!creating) {
      setShowNewProject(false);
      setFormErrors({});
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-9 w-64 bg-slate-200 animate-pulse rounded mb-2" />
              <div className="h-5 w-96 bg-slate-200 animate-pulse rounded" />
            </div>
            <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error && projects.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState
            title="Failed to load projects"
            message={error}
            onRetry={loadProjects}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Agent Dashboard</h1>
            <p className="mt-2 text-slate-600">Orchestrate 10 specialized agents to build products</p>
          </div>
          <div className="flex gap-3">
            <Link href="/tests">
              <Button
                variant="outline"
                size="md"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
              >
                Test Scenarios
              </Button>
            </Link>
            <Link href="/generate">
              <Button
                variant="outline"
                size="md"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              >
                Generate Repo
              </Button>
            </Link>
            <Button
              onClick={() => setShowNewProject(true)}
              variant="primary"
              size="md"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              New Project
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && projects.length > 0 && (
          <InlineError message={error} className="mb-6" />
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            title="No projects yet"
            description="Create your first project to start orchestrating AI agents and building amazing products."
            action={
              <Button onClick={() => setShowNewProject(true)} variant="primary">
                Create Your First Project
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
              >
                <Card hoverable clickable>
                  <CardContent>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center justify-between w-full">
                      <Badge variant={STAGE_VARIANTS[project.stage] || 'default'}>
                        {project.stage}
                      </Badge>
                      <span className="text-sm text-slate-500">v{project.version}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Create Project Dialog */}
        <Dialog open={showNewProject} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new project to start working with AI agents. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-4">
                <Input
                  label="Project Name"
                  placeholder="My Awesome App"
                  value={newProject.name}
                  onChange={(e) => {
                    setNewProject({ ...newProject, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                  error={formErrors.name}
                  required
                  disabled={creating}
                />

                <Textarea
                  label="Description"
                  placeholder="Describe what this project does and its main goals..."
                  value={newProject.description}
                  onChange={(e) => {
                    setNewProject({ ...newProject, description: e.target.value });
                    if (formErrors.description) {
                      setFormErrors({ ...formErrors, description: '' });
                    }
                  }}
                  error={formErrors.description}
                  required
                  disabled={creating}
                  rows={3}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Timeline"
                    placeholder="e.g., 4 weeks"
                    value={newProject.timeline}
                    onChange={(e) => setNewProject({ ...newProject, timeline: e.target.value })}
                    hint="Optional"
                    disabled={creating}
                  />
                  <Input
                    label="Budget"
                    placeholder="e.g., $5,000"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    hint="Optional"
                    disabled={creating}
                  />
                </div>

                <Input
                  label="Tech Stack"
                  placeholder="e.g., Next.js, TypeScript, Tailwind CSS"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  hint="Optional"
                  disabled={creating}
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                onClick={handleDialogClose}
                variant="outline"
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={createProject}
                variant="primary"
                disabled={creating || !newProject.name.trim() || !newProject.description.trim()}
                loading={creating}
              >
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        <ToastContainer position="top-right">
          {toast.show && (
            <Toast
              variant={toast.variant}
              title={toast.title}
              description={toast.description}
              onClose={() => setToast({ ...toast, show: false })}
            />
          )}
        </ToastContainer>
      </div>
    </main>
  );
}
