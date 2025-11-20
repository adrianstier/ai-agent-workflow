'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Agent, Message } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState, InlineError } from '@/components/ui/error-state';
import { Toast, ToastContainer } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [project, setProject] = useState<any>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [executing, setExecuting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    variant: 'success' | 'error' | 'info';
    title: string;
    description?: string;
  }>({
    show: false,
    variant: 'success',
    title: '',
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, executing]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function loadData() {
    try {
      setError(null);
      const [projectData, agentsData] = await Promise.all([
        api.getProject(projectId),
        api.getAgents(),
      ]);
      setProject(projectData);
      setAgents(agentsData);
      setMessages(projectData.messages || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load project data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function executeAgent() {
    if (!selectedAgent || !userMessage.trim()) return;

    const messageToSend = userMessage.trim();
    setUserMessage('');
    setExecuting(true);

    try {
      const result = await api.executeAgent(projectId, selectedAgent.id, messageToSend);

      // Add messages
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'USER',
          content: messageToSend,
          createdAt: new Date().toISOString(),
        } as Message,
        {
          id: (Date.now() + 1).toString(),
          role: 'AGENT',
          agentId: selectedAgent.id,
          content: result.output,
          createdAt: new Date().toISOString(),
        } as Message,
      ]);

      showToast(
        'success',
        'Agent execution completed',
        `${result.tokensUsed.toLocaleString()} tokens • $${result.cost.toFixed(4)}`
      );

      // Reload project to get latest data
      loadData();
    } catch (err: any) {
      console.error('Agent execution failed:', err);
      showToast('error', 'Agent execution failed', err.message || 'Please try again');
      setUserMessage(messageToSend); // Restore message on error
    } finally {
      setExecuting(false);
    }
  }

  function showToast(variant: 'success' | 'error' | 'info', title: string, description?: string) {
    setToast({ show: true, variant, title, description });
    setTimeout(() => setToast({ show: false, variant: 'success', title: '' }), 6000);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!executing && selectedAgent && userMessage.trim()) {
        executeAgent();
      }
    }
  }

  // Custom link handler for agent navigation in markdown
  function handleAgentLink(href: string, linkText: string): boolean {
    // Check if this looks like an agent reference
    const agentPatterns = [
      /agent[- ]?(\d+)/i,
      /research/i,
      /problem[- ]?framer/i,
      /product[- ]?manager|pm|prd/i,
      /ux|designer/i,
      /architect/i,
      /engineer/i,
      /qa|quality/i,
      /devops/i,
      /analytics/i,
      /orchestrator/i,
    ];

    const textToCheck = `${href} ${linkText}`.toLowerCase();

    // Find matching agent by name pattern
    for (const agent of agents) {
      const agentNameLower = agent.name.toLowerCase();
      const agentRoleLower = agent.role.toLowerCase();

      // Check if text references this agent
      if (
        textToCheck.includes(agentNameLower) ||
        agentNameLower.includes(textToCheck.replace(/[^a-z0-9]/g, '')) ||
        textToCheck.includes(agentRoleLower.split(' ')[0])
      ) {
        setSelectedAgent(agent);
        showToast('info', `Switched to ${agent.name}`, agent.role);
        return true;
      }
    }

    // Try to match by agent number in the href
    const numberMatch = href.match(/(\d+)/);
    if (numberMatch) {
      const agentNumber = parseInt(numberMatch[1]);
      // Find agent with this number in their name
      const matchedAgent = agents.find(a =>
        a.name.toLowerCase().includes(`agent ${agentNumber}`) ||
        a.name.match(new RegExp(`\\b${agentNumber}\\b`))
      );
      if (matchedAgent) {
        setSelectedAgent(matchedAgent);
        showToast('info', `Switched to ${matchedAgent.name}`, matchedAgent.role);
        return true;
      }
    }

    return false;
  }

  // Custom ReactMarkdown components for handling links
  const markdownComponents: Components = {
    a: ({ href, children, ...props }) => {
      const linkText = typeof children === 'string' ? children :
        Array.isArray(children) ? children.join('') : '';

      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            const linkHref = href || '';

            // Check if it's a valid external URL
            if (linkHref.startsWith('http://') || linkHref.startsWith('https://')) {
              window.open(linkHref, '_blank', 'noopener,noreferrer');
              return;
            }

            // Try to handle as agent navigation
            const handled = handleAgentLink(linkHref, linkText);

            if (!handled) {
              // If not recognized as agent link, show a message
              showToast('info', 'Click agent in sidebar', `Select an agent from the sidebar to continue`);
            }
          }}
          className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium"
        >
          {children}
        </button>
      );
    },
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="xl" variant="primary" label="Loading project..." />
      </main>
    );
  }

  if (error && !project) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="mb-4"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Back to Projects
          </Button>
          <ErrorState title="Failed to load project" message={error} onRetry={loadData} />
        </div>
      </main>
    );
  }

  const constraints = project?.constraints ? JSON.parse(project.constraints) : {};

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            size="sm"
            className="mb-4"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Back to Projects
          </Button>

          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{project.name}</h1>
          {project.description && <p className="mt-2 text-slate-600">{project.description}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="primary">{project.stage}</Badge>
            {constraints.timeline && constraints.timeline !== 'Not specified' && (
              <span className="text-slate-600 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {constraints.timeline}
              </span>
            )}
            {constraints.budget && constraints.budget !== 'Not specified' && (
              <span className="text-slate-600 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {constraints.budget}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agents Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      disabled={executing}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150',
                        'border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        selectedAgent?.id === agent.id
                          ? 'bg-blue-50 border-blue-500 shadow-sm'
                          : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:border-slate-200'
                      )}
                    >
                      <div className="font-medium text-sm text-slate-900">{agent.name}</div>
                      <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">{agent.role}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Executions</span>
                    <Badge variant="outline">{project.executions?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Messages</span>
                    <Badge variant="outline">{messages.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Artifacts</span>
                    <Badge variant="outline">{project.artifacts?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Version</span>
                    <Badge variant="default">v{project.version}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col h-[calc(100vh-280px)] lg:h-[calc(100vh-220px)]">
              {/* Chat Header */}
              <div className="border-b border-slate-200 px-6 py-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedAgent ? selectedAgent.name : 'Select an agent to start'}
                </h2>
                {selectedAgent && <p className="text-sm text-slate-600 mt-0.5">{selectedAgent.role}</p>}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
                {!selectedAgent ? (
                  <EmptyState
                    icon={
                      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    }
                    title="No agent selected"
                    description="Choose an AI agent from the sidebar to start a conversation and build your project."
                  />
                ) : messages.length === 0 ? (
                  <EmptyState
                    icon={
                      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    }
                    title="Start a conversation"
                    description="Send a message to begin working with this agent. Describe your goals, ask questions, or request specific tasks."
                  />
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn('flex animate-in fade-in slide-in-from-bottom-2 duration-200', {
                          'justify-end': msg.role === 'USER',
                          'justify-start': msg.role === 'AGENT',
                        })}
                      >
                        <div
                          className={cn('max-w-[85%] rounded-lg px-4 py-3 shadow-sm', {
                            'bg-blue-600 text-white': msg.role === 'USER',
                            'bg-white border border-slate-200 text-slate-900': msg.role === 'AGENT',
                          })}
                        >
                          {msg.role === 'AGENT' && msg.agentId !== undefined && (
                            <div className="text-xs font-medium mb-2 text-blue-600 flex items-center gap-1">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {agents.find((a) => a.id === msg.agentId)?.name || `Agent ${msg.agentId}`}
                            </div>
                          )}
                          <div
                            className={cn('prose prose-sm max-w-none', {
                              'prose-invert': msg.role === 'USER',
                              'prose-slate': msg.role === 'AGENT',
                            })}
                          >
                            <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}

                    {executing && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Spinner size="sm" variant="primary" />
                            <span className="text-sm text-slate-600">
                              {selectedAgent?.name} is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <textarea
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      selectedAgent
                        ? 'Type your message... (Enter to send, Shift+Enter for new line)'
                        : 'Select an agent first'
                    }
                    disabled={!selectedAgent || executing}
                    rows={2}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg border resize-none transition-all duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500',
                      'border-slate-300'
                    )}
                  />
                  <Button
                    onClick={executeAgent}
                    disabled={!selectedAgent || !userMessage.trim() || executing}
                    loading={executing}
                    variant="primary"
                    size="md"
                    className="self-end"
                    icon={
                      !executing && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )
                    }
                  >
                    Send
                  </Button>
                </div>
                {selectedAgent && (
                  <p className="text-xs text-slate-500 mt-2">
                    Press Enter to send • Shift+Enter for new line • Executions cost ~$0.01-0.15 each
                  </p>
                )}
              </div>
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
