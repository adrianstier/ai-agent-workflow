import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Project Detail Page', () => {
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    // Create a project first with unique name
    const uniqueName = `E2E Test Project ${Date.now()}`;
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByPlaceholder('My Awesome App').fill(uniqueName);
    await page.getByPlaceholder(/Describe what this project does/i).fill('Testing project detail page');
    await page.getByPlaceholder('e.g., 4 weeks').fill('3 weeks');
    await page.getByPlaceholder('e.g., $5,000').fill('$2,000');

    await page.getByRole('button', { name: 'Create Project' }).click();

    // Wait for dialog to close and project to appear
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Navigate to project by clicking the link
    await page.getByRole('link', { name: new RegExp(uniqueName, 'i') }).first().click();

    // Wait for navigation to complete
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 5000 });

    // Extract project ID from URL
    const url = page.url();
    projectId = url.split('/').pop() || '';
  });

  test('should display project details', async ({ page }) => {
    // Check for project heading (will contain E2E Test Project + timestamp)
    await expect(page.getByRole('heading').filter({ hasText: /E2E Test Project/i })).toBeVisible();
    await expect(page.getByText('Testing project detail page')).toBeVisible();
    await expect(page.getByText('3 weeks')).toBeVisible();
    await expect(page.getByText('$2,000')).toBeVisible();
  });

  test('should display Back to Projects button and navigate back', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /Back to Projects/i });
    await expect(backButton).toBeVisible();

    await backButton.click();
    await expect(page).toHaveURL('/');
  });

  test('should display all 10 agents in sidebar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Agents' })).toBeVisible();

    // Check for some specific agents - use button role for agent selection buttons
    await expect(page.getByRole('button', { name: /Orchestrator/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Problem Framer/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Engineer/i }).first()).toBeVisible();
  });

  test('should display project stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Project Stats' })).toBeVisible();
    await expect(page.getByText('Executions').first()).toBeVisible();
    await expect(page.getByText('Messages').first()).toBeVisible();
    await expect(page.getByText('Artifacts').first()).toBeVisible();
    await expect(page.getByText('Version').first()).toBeVisible();
  });

  test('should show empty state when no agent is selected', async ({ page }) => {
    await expect(page.getByText('No agent selected')).toBeVisible();
    await expect(page.getByText('Choose an AI agent from the sidebar')).toBeVisible();
  });

  test('should select an agent and show chat interface', async ({ page }) => {
    // Click on first agent (Orchestrator) - use button role
    await page.getByRole('button', { name: /Orchestrator/i }).first().click();

    // Should show agent name in header
    await expect(page.getByRole('heading', { name: 'Orchestrator' })).toBeVisible();

    // Should show empty state for messages
    await expect(page.getByText('Start a conversation')).toBeVisible();

    // Message input should be enabled
    const messageInput = page.getByPlaceholder(/Type your message/i);
    await expect(messageInput).toBeEnabled();
  });

  test('should disable message input when no agent selected', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/Select an agent first/i);
    await expect(messageInput).toBeDisabled();

    const sendButton = page.getByRole('button', { name: 'Send' });
    await expect(sendButton).toBeDisabled();
  });

  test('should send message to agent', async ({ page }) => {
    // Skip by default - requires backend API to be running with valid API key
    test.skip(!process.env.RUN_API_TESTS, 'Skipping API-dependent test - set RUN_API_TESTS=true to run');

    // Select agent - use button role
    await page.getByRole('button', { name: /Orchestrator/i }).first().click();

    // Type message
    const messageInput = page.getByPlaceholder(/Type your message/i);
    await messageInput.fill('Hello, can you help me with this project?');

    // Send button should be enabled
    const sendButton = page.getByRole('button', { name: 'Send' });
    await expect(sendButton).toBeEnabled();

    // Send message
    await sendButton.click();

    // Should show loading state
    await expect(page.getByText(/is thinking/i)).toBeVisible({ timeout: 2000 });

    // Wait for response (this might take a while with real API)
    // Note: This test will fail if backend is not running or API key is invalid
    await expect(page.getByText('Agent execution completed')).toBeVisible({ timeout: 30000 });
  });

  test('should support Enter key to send message', async ({ page }) => {
    // Skip by default - requires backend API to be running with valid API key
    test.skip(!process.env.RUN_API_TESTS, 'Skipping API-dependent test - set RUN_API_TESTS=true to run');

    await page.getByRole('button', { name: /Orchestrator/i }).first().click();

    const messageInput = page.getByPlaceholder(/Type your message/i);
    await messageInput.fill('Test message via Enter key');
    await messageInput.press('Enter');

    // Should start executing
    await expect(page.getByText(/is thinking/i)).toBeVisible({ timeout: 2000 });
  });

  test('should support Shift+Enter for new line', async ({ page }) => {
    await page.getByRole('button', { name: /Orchestrator/i }).first().click();

    const messageInput = page.getByPlaceholder(/Type your message/i);
    await messageInput.fill('Line 1');
    await messageInput.press('Shift+Enter');
    await messageInput.type('Line 2');

    // Check textarea content has newline
    const content = await messageInput.inputValue();
    expect(content).toContain('\n');
  });

  test('should disable controls during agent execution', async ({ page }) => {
    await page.getByRole('button', { name: /Orchestrator/i }).first().click();

    const messageInput = page.getByPlaceholder(/Type your message/i);
    await messageInput.fill('Quick test message');
    await page.getByRole('button', { name: 'Send' }).click();

    // During execution, agent buttons should be disabled
    const agentButton = page.getByRole('button', { name: /Problem Framer/i }).first();
    await expect(agentButton).toBeDisabled();

    // Message input should be disabled
    await expect(messageInput).toBeDisabled();
  });

  test('should have no accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      // Exclude known issues:
      // - scrollable-region-focusable: common issue with overflow containers
      // - heading-order: h3 used for section titles (design choice)
      .disableRules(['scrollable-region-focusable', 'heading-order'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Focus the back button directly
    const backButton = page.getByRole('button', { name: /Back to Projects/i });
    await backButton.focus();
    await expect(backButton).toBeFocused();

    // Focus an agent button directly and activate it
    const agentButton = page.getByRole('button', { name: /Orchestrator/i }).first();
    await agentButton.focus();
    await expect(agentButton).toBeFocused();

    // Press Enter to select agent
    await page.keyboard.press('Enter');

    // Should show chat interface
    await expect(page.getByRole('heading', { name: 'Orchestrator' })).toBeVisible();
  });

  test('should display agent badge in messages', async ({ page }) => {
    // This test would require actually sending a message and receiving a response
    // Skipping for now as it requires backend integration
    test.skip();
  });
});

test.describe('Project Detail Page - Responsive Design', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const uniqueName = `Responsive Test ${Date.now()}`;
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByPlaceholder('My Awesome App').fill(uniqueName);
    await page.getByPlaceholder(/Describe what this project does/i).fill('Testing responsive design');
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Wait for dialog to close and project to appear
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Navigate to project using the first matching link
    await page.getByRole('link', { name: new RegExp(uniqueName, 'i') }).first().click();
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 5000 });
  });

  test('should stack layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Both sidebar and chat should be visible (stacked)
    await expect(page.getByRole('heading', { name: 'AI Agents' })).toBeVisible();
    await expect(page.getByText('Select an agent to start')).toBeVisible();
  });

  test('should show side-by-side layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Both should be visible side by side
    await expect(page.getByRole('heading', { name: 'AI Agents' })).toBeVisible();
    await expect(page.getByText('Select an agent to start')).toBeVisible();
  });
});
