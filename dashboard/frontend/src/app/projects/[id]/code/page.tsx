'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Toast, ToastContainer } from '@/components/ui/toast';

interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
  size?: number;
}

interface FileContent {
  content: string;
  sha: string;
  path: string;
  name: string;
}

export default function CodeBrowserPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    variant: 'success' | 'error';
    title: string;
    description?: string;
  }>({
    show: false,
    variant: 'success',
    title: '',
  });

  useEffect(() => {
    loadRepoInfo();
    loadBranches();
    loadFiles(currentPath);
  }, []);

  async function loadRepoInfo() {
    try {
      const res = await fetch('http://localhost:4000/api/github/repo');
      if (res.ok) {
        const data = await res.json();
        setRepoInfo(data);
      }
    } catch (err) {
      console.error('Failed to load repo info:', err);
    }
  }

  async function loadBranches() {
    try {
      const res = await fetch('http://localhost:4000/api/github/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    }
  }

  async function loadFiles(path: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `http://localhost:4000/api/github/tree?path=${encodeURIComponent(path)}&ref=${currentBranch}`
      );

      if (!res.ok) {
        throw new Error('Failed to load files');
      }

      const data = await res.json();
      const fileList = Array.isArray(data) ? data : [data];
      setFiles(fileList);
      setCurrentPath(path);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadFile(path: string) {
    try {
      const res = await fetch(
        `http://localhost:4000/api/github/file?path=${encodeURIComponent(path)}&ref=${currentBranch}`
      );

      if (!res.ok) {
        throw new Error('Failed to load file');
      }

      const data = await res.json();
      setSelectedFile(data);
      setEditedContent(data.content);
      setEditing(false);
    } catch (err: any) {
      showToast('error', 'Failed to load file', err.message);
    }
  }

  async function saveFile() {
    if (!selectedFile) return;

    try {
      const res = await fetch('http://localhost:4000/api/github/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile.path,
          content: editedContent,
          message: `Update ${selectedFile.name} via AI Dashboard`,
          sha: selectedFile.sha,
          branch: currentBranch,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save file');
      }

      showToast('success', 'File saved successfully', 'Changes pushed to GitHub');
      setEditing(false);
      // Reload file to get new SHA
      await loadFile(selectedFile.path);
    } catch (err: any) {
      showToast('error', 'Failed to save file', err.message);
    }
  }

  function showToast(variant: 'success' | 'error', title: string, description?: string) {
    setToast({ show: true, variant, title, description });
    setTimeout(() => setToast({ show: false, variant: 'success', title: '' }), 5000);
  }

  function navigateToPath(path: string, type: string) {
    if (type === 'dir') {
      loadFiles(path);
      setSelectedFile(null);
    } else {
      loadFile(path);
    }
  }

  function navigateUp() {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    const newPath = pathParts.join('/');
    loadFiles(newPath);
    setSelectedFile(null);
  }

  function getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
      sh: 'bash',
    };
    return languageMap[ext || ''] || 'plaintext';
  }

  if (loading && files.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="xl" variant="primary" label="Loading repository..." />
      </main>
    );
  }

  if (error && files.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={() => router.push(`/projects/${projectId}`)} variant="ghost" className="mb-4">
            ← Back to Project
          </Button>
          <ErrorState
            title="Failed to load repository"
            message={error}
            onRetry={() => loadFiles(currentPath)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button onClick={() => router.push(`/projects/${projectId}`)} variant="ghost" size="sm" className="mb-4">
            ← Back to Project
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Code Browser</h1>
              {repoInfo && (
                <p className="text-slate-600 mt-1">
                  {repoInfo.full_name} • {repoInfo.private ? 'Private' : 'Public'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={currentBranch}
                onChange={(e) => {
                  setCurrentBranch(e.target.value);
                  loadFiles(currentPath);
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm"
              >
                {branches.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mt-4 text-sm">
            <button
              onClick={() => loadFiles('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {repoInfo?.name || 'root'}
            </button>
            {currentPath.split('/').filter(Boolean).map((part, index, arr) => (
              <span key={index} className="flex items-center gap-2">
                <span className="text-slate-400">/</span>
                <button
                  onClick={() => {
                    const path = arr.slice(0, index + 1).join('/');
                    loadFiles(path);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Browser */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Files</span>
                  {currentPath && (
                    <button
                      onClick={navigateUp}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      ↑ Up
                    </button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => navigateToPath(file.path, file.type)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2 ${
                        selectedFile?.path === file.path ? 'bg-blue-50' : ''
                      }`}
                    >
                      {file.type === 'dir' ? (
                        <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                      <span className="text-sm truncate">{file.name}</span>
                      {file.type === 'dir' && <span className="ml-auto text-slate-400">→</span>}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Viewer/Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {selectedFile ? selectedFile.name : 'Select a file'}
                  </CardTitle>
                  {selectedFile && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getLanguage(selectedFile.name)}</Badge>
                      {editing ? (
                        <>
                          <Button onClick={() => setEditing(false)} variant="ghost" size="sm">
                            Cancel
                          </Button>
                          <Button onClick={saveFile} variant="primary" size="sm">
                            Save
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedFile ? (
                  <div className="font-mono text-sm">
                    {editing ? (
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-[600px] p-4 border border-slate-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <pre className="p-4 bg-slate-50 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                        <code>{selectedFile.content}</code>
                      </pre>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-12">
                    Select a file from the browser to view or edit
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
