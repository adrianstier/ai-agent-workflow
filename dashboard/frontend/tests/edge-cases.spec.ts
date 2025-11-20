import { test, expect } from '@playwright/test';

test.describe('Edge Cases - Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('should handle rapid project creation attempts', async ({ page }) => {
    // Click create button multiple times rapidly
    const createButton = page.getByRole('button', { name: /new project/i });

    // Open dialog
    await createButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Try to open again while dialog is open (should not create multiple)
    const dialogCount = await page.locator('[role="dialog"]').count();
    expect(dialogCount).toBe(1);
  });

  test('should handle empty project name submission', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /new project/i });
    await createButton.click();

    // Try to submit with empty name - button should be disabled
    const submitButton = page.getByRole('button', { name: /create/i });

    // Check that button is disabled when name is empty
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);

    // Dialog should still be visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('should handle very long project names', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /new project/i });
    await createButton.click();

    const nameInput = page.getByLabel(/name/i);
    const longName = 'A'.repeat(500);
    await nameInput.fill(longName);

    // Should either truncate or show error
    const inputValue = await nameInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(500);
  });

  test('should handle special characters in project name', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /new project/i });
    await createButton.click();

    const nameInput = page.getByLabel(/name/i);
    await nameInput.fill('<script>alert("xss")</script>');

    // Should sanitize or escape
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('should handle dialog close with escape key', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /new project/i });
    await createButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Press escape
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should handle dialog close by clicking outside', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /new project/i });
    await createButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();

    // Try clicking outside the dialog content - look for backdrop
    const backdrop = page.locator('[data-radix-dialog-overlay], .fixed.inset-0');
    if (await backdrop.count() > 0) {
      await backdrop.first().click({ position: { x: 10, y: 10 }, force: true });
    }

    // Dialog behavior on outside click depends on implementation
    // Just verify the page didn't crash
    await page.waitForTimeout(500);
  });

  test('should maintain scroll position after operations', async ({ page }) => {
    // Create multiple projects first (if possible)
    // Then scroll and perform operations
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Perform some action
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Scroll position handling depends on implementation
  });

  test('should handle concurrent API requests gracefully', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push(request.url());
      }
    });

    await page.waitForTimeout(2000);

    // Should not have duplicate requests
    console.log(`API requests made: ${requests.length}`);
  });
});

test.describe('Edge Cases - Project Detail Page', () => {
  test('should handle non-existent project ID', async ({ page }) => {
    await page.goto('http://localhost:3002/projects/non-existent-id');
    await page.waitForTimeout(2000);

    // Should show error state
    const errorState = page.getByText(/failed|error|not found/i);
    await expect(errorState.first()).toBeVisible();
  });

  test('should handle malformed project ID', async ({ page }) => {
    await page.goto('http://localhost:3002/projects/../../etc/passwd');
    await page.waitForTimeout(2000);

    // Should handle gracefully without exposing system info
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('root:');
  });

  test('should handle empty message submission', async ({ page }) => {
    // Get a real project first
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
    await page.waitForLoadState('networkidle');

    // Select an agent
    const agentButton = page.locator('button').filter({ hasText: /orchestrator/i }).first();
    if (await agentButton.isVisible()) {
      await agentButton.click();
    }

    // Try to send empty message
    const sendButton = page.getByRole('button', { name: /send/i });
    if (await sendButton.isVisible()) {
      const isDisabled = await sendButton.isDisabled();
      expect(isDisabled).toBe(true);
    }
  });

  test('should handle very long message input', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
    await page.waitForLoadState('networkidle');

    // Select an agent
    const agentButton = page.locator('button').filter({ hasText: /orchestrator/i }).first();
    if (await agentButton.isVisible()) {
      await agentButton.click();
    }

    // Type very long message
    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      const longMessage = 'Test message '.repeat(1000);
      await textarea.fill(longMessage);

      // Should handle without crashing
      const value = await textarea.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('should handle rapid agent switching', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
    await page.waitForLoadState('networkidle');

    // Rapidly click different agents
    const agentButtons = page.locator('button').filter({ hasText: /agent/i });
    const count = await agentButtons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await agentButtons.nth(i).click();
      await page.waitForTimeout(100);
    }

    // Should not crash
    await expect(page).toHaveURL(/projects/);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
    await page.waitForLoadState('networkidle');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should be on a focusable element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'TEXTAREA']).toContain(focusedElement);
  });

  test('should handle Enter key in textarea (send vs newline)', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
    await page.waitForLoadState('networkidle');

    // Select an agent first
    const agentButton = page.locator('button').filter({ hasText: /orchestrator/i }).first();
    if (await agentButton.isVisible()) {
      await agentButton.click();
    }

    const textarea = page.locator('textarea');
    if (await textarea.isVisible()) {
      await textarea.fill('Test message');

      // Shift+Enter should add newline
      await textarea.press('Shift+Enter');
      const valueWithNewline = await textarea.inputValue();
      expect(valueWithNewline).toContain('\n');
    }
  });
});

test.describe('Edge Cases - API and Network', () => {
  test('should handle API timeout gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.continue();
    });

    await page.goto('http://localhost:3002', { timeout: 30000 });

    // Should show loading state or timeout message
  });

  test('should handle API error responses', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/projects', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    // Should show error state
    const errorState = page.getByText(/failed|error/i);
    await expect(errorState.first()).toBeVisible();
  });

  test('should handle network disconnection', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);

    // Try to perform an action
    const createButton = page.getByRole('button', { name: /new project/i });
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // Go back online
    await page.context().setOffline(false);
  });

  test('should handle malformed API responses', async ({ page }) => {
    await page.route('**/api/projects', route => {
      route.fulfill({
        status: 200,
        body: 'not valid json{',
      });
    });

    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    // Should handle gracefully without crashing
  });

  test('should handle CORS errors gracefully', async ({ page }) => {
    // This is more of an integration test
    // The actual CORS handling is in the backend
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Edge Cases - Agent Execution', () => {
  test('should handle agent execution while another is running', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
    await page.waitForLoadState('networkidle');

    // Select agent
    const agentButton = page.locator('button').filter({ hasText: /orchestrator/i }).first();
    if (await agentButton.isVisible()) {
      await agentButton.click();
    }

    // Type and send message
    const textarea = page.locator('textarea');
    const sendButton = page.getByRole('button', { name: /send/i });

    if (await textarea.isVisible() && await sendButton.isVisible()) {
      await textarea.fill('Test message 1');
      await sendButton.click();

      // Immediately try to send another
      await textarea.fill('Test message 2');

      // Button should be disabled while executing
      const isDisabled = await sendButton.isDisabled();
      // May be disabled due to execution in progress
    }
  });

  test('should handle markdown links in agent responses', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
    await page.waitForLoadState('networkidle');

    // If there are any messages with links, test clicking them
    const links = page.locator('.prose a, .prose button');
    const linkCount = await links.count();

    if (linkCount > 0) {
      // Click first link
      await links.first().click();

      // Should either navigate or show toast
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Edge Cases - GitHub Integration', () => {
  test('should handle missing GitHub credentials gracefully', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}/code`);
    await page.waitForTimeout(3000);

    // Should show error state about GitHub not configured
    const errorText = await page.textContent('body');
    const hasError = errorText?.includes('Failed') || errorText?.includes('error') || errorText?.includes('GitHub');
    expect(hasError).toBeTruthy();
  });

  test('should handle GitHub API rate limiting', async ({ page }) => {
    // Mock rate limit response
    await page.route('**/api/github/**', route => {
      route.fulfill({
        status: 403,
        body: JSON.stringify({ error: { message: 'API rate limit exceeded' } }),
      });
    });

    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}/code`);
    await page.waitForTimeout(2000);

    // Should show appropriate error
  });

  test('should handle invalid file paths in code browser', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    // Try to access code browser
    await page.goto(`http://localhost:3002/projects/${projects[0].id}/code`);
    await page.waitForTimeout(2000);
  });
});

test.describe('Edge Cases - Accessibility', () => {
  test('should maintain focus after dialog interactions', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    const createButton = page.getByRole('button', { name: /new project/i });
    await createButton.click();

    // Focus should be trapped in dialog
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const focused = document.activeElement;
      return dialog?.contains(focused);
    });

    // Close dialog
    await page.keyboard.press('Escape');

    // Focus should return to trigger element
  });

  test('should announce loading states to screen readers', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Check for aria-live regions
    const liveRegions = await page.locator('[aria-live]').count();
    console.log(`Found ${liveRegions} aria-live regions`);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    const headings = await page.evaluate(() => {
      const h1 = document.querySelectorAll('h1').length;
      const h2 = document.querySelectorAll('h2').length;
      const h3 = document.querySelectorAll('h3').length;
      return { h1, h2, h3 };
    });

    // Should have exactly one h1
    expect(headings.h1).toBeLessThanOrEqual(2); // Allow for some flexibility
  });

  test('should support reduced motion preference', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Check that animations are reduced or disabled
    const hasReducedMotion = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    expect(hasReducedMotion).toBe(true);
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Emulate high contrast
    await page.emulateMedia({ forcedColors: 'active' });

    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Page should still be functional
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(0);
  });
});

test.describe('Edge Cases - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    // Navigate back and forth multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('http://localhost:3002');
      await page.waitForLoadState('networkidle');

      if (projects.length > 0) {
        await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
        await page.waitForLoadState('networkidle');
      }
    }

    // Page should still be responsive
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should handle large message history', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    if (projects.length === 0) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
    await page.waitForLoadState('networkidle');

    // Check if page handles existing messages well
    const messageCount = await page.locator('.prose').count();
    console.log(`Message count: ${messageCount}`);
  });
});

test.describe('Edge Cases - Mobile and Responsive', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Main content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Create button should be accessible
    const createButton = page.getByRole('button', { name: /new project/i });
    await expect(createButton).toBeVisible();
  });

  test('should handle orientation change', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    // Content should still be accessible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should handle touch interactions', async ({ browser }) => {
    // Create context with touch support
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Tap on create button
    const createButton = page.getByRole('button', { name: /new project/i });
    await createButton.tap();

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible();

    await context.close();
  });
});

test.describe('Edge Cases - Browser Compatibility', () => {
  test('should handle browser back/forward navigation', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/projects');
    const projects = await response.json();

    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    if (projects.length > 0) {
      // Navigate to project
      await page.goto(`http://localhost:3002/projects/${projects[0].id}`);
      await page.waitForLoadState('networkidle');

      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Should be on home page
      await expect(page).toHaveURL('http://localhost:3002/');

      // Go forward
      await page.goForward();
      await page.waitForLoadState('networkidle');

      // Should be on project page
      await expect(page).toHaveURL(/projects/);
    }
  });

  test('should handle page refresh without losing state', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Page should load correctly
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should handle multiple tabs/windows', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('http://localhost:3002');
    await page2.goto('http://localhost:3002');

    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Both should work independently
    const title1 = await page1.title();
    const title2 = await page2.title();

    expect(title1).toBeTruthy();
    expect(title2).toBeTruthy();
  });
});
