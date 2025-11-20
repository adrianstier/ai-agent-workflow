import { test, expect } from '@playwright/test';

test('debug page load and API calls', async ({ page }) => {
  const consoleMessages: string[] = [];
  const networkErrors: string[] = [];
  const apiCalls: { url: string; status: number }[] = [];

  // Capture console messages
  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    consoleMessages.push(`[pageerror] ${error.message}`);
  });

  // Capture network requests
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      apiCalls.push({ url, status: response.status() });

      if (!response.ok()) {
        try {
          const body = await response.text();
          networkErrors.push(`${response.status()} ${url}: ${body.substring(0, 200)}`);
        } catch (e) {
          networkErrors.push(`${response.status()} ${url}: Could not read response`);
        }
      }
    }
  });

  // Navigate to page
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002');

  // Wait for network to settle
  await page.waitForLoadState('networkidle');

  // Wait a bit more for any delayed requests
  await page.waitForTimeout(3000);

  // Log all captured information
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(msg));

  console.log('\n=== API CALLS ===');
  apiCalls.forEach(call => console.log(`${call.status} ${call.url}`));

  console.log('\n=== NETWORK ERRORS ===');
  if (networkErrors.length > 0) {
    networkErrors.forEach(err => console.log(err));
  } else {
    console.log('No network errors!');
  }

  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-screenshot.png', fullPage: true });
  console.log('\nScreenshot saved to test-results/debug-screenshot.png');

  // Check page state
  const heading = await page.getByRole('heading', { name: 'AI Agent Dashboard' }).isVisible();
  console.log('\n=== PAGE STATE ===');
  console.log(`Heading visible: ${heading}`);

  // Check for error state
  const errorText = await page.getByText(/Failed to load/i).isVisible();
  console.log(`Error message visible: ${errorText}`);

  // Get page HTML
  if (errorText) {
    const errorHTML = await page.content();
    console.log('\n=== ERROR PAGE HTML (first 500 chars) ===');
    console.log(errorHTML.substring(0, 500));
  }
});
