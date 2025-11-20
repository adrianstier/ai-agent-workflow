import { test, expect } from '@playwright/test';

test('complete user flow - view page and check projects', async ({ page }) => {
  // Navigate to page
  await page.goto('http://localhost:3002');
  console.log('Navigated to home page');

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take screenshot of initial state
  await page.screenshot({ path: 'test-results/01-home-page.png', fullPage: true });
  console.log('Screenshot 1: Home page loaded');

  // Check if heading is visible
  const heading = page.getByRole('heading', { name: 'AI Agent Dashboard' });
  await expect(heading).toBeVisible({ timeout: 10000 });
  console.log('✅ Heading is visible');

  // Check if New Project button exists
  const newProjectButton = page.getByRole('button', { name: /New Project/i });
  await expect(newProjectButton).toBeVisible({ timeout: 5000 });
  console.log('✅ New Project button is visible');

  // Check for existing projects or empty state
  const projectCards = page.locator('.line-clamp-2'); // Project description
  const emptyState = page.getByText('No projects yet');

  const hasProjects = await projectCards.count() > 0;
  const hasEmptyState = await emptyState.isVisible();

  console.log(`Projects count: ${await projectCards.count()}`);
  console.log(`Has empty state: ${hasEmptyState}`);

  // Click New Project button
  console.log('Clicking New Project button...');
  await newProjectButton.click();
  await page.waitForTimeout(1000);

  // Take screenshot after clicking
  await page.screenshot({ path: 'test-results/02-after-button-click.png', fullPage: true });
  console.log('Screenshot 2: After clicking New Project');

  // Check if dialog opened
  const dialog = page.getByRole('dialog');
  const dialogVisible = await dialog.isVisible();
  console.log(`Dialog visible: ${dialogVisible}`);

  if (dialogVisible) {
    console.log('✅ Dialog opened successfully!');

    // Take screenshot of dialog
    await page.screenshot({ path: 'test-results/03-dialog-open.png', fullPage: true });

    // Check form fields
    const nameInput = page.getByLabel('Project Name');
    const descInput = page.getByLabel('Description');

    console.log(`Name input visible: ${await nameInput.isVisible()}`);
    console.log(`Description input visible: ${await descInput.isVisible()}`);

  } else {
    console.log('❌ Dialog did not open');

    // Check what's on the page instead
    const pageContent = await page.content();
    console.log('Page HTML length:', pageContent.length);

    // Look for any modals or overlays
    const modals = page.locator('[role="dialog"], .modal, .fixed.inset-0');
    console.log(`Found ${await modals.count()} potential modal elements`);

    for (let i = 0; i < await modals.count(); i++) {
      const modal = modals.nth(i);
      console.log(`Modal ${i}: visible=${await modal.isVisible()}, display=${await modal.evaluate(el => window.getComputedStyle(el).display)}`);
    }
  }
});

test('verify API connection', async ({ page }) => {
  const responses: { url: string; status: number; body?: any }[] = [];

  page.on('response', async (response) => {
    if (response.url().includes('/api/')) {
      try {
        const body = await response.json();
        responses.push({ url: response.url(), status: response.status(), body });
      } catch (e) {
        responses.push({ url: response.url(), status: response.status() });
      }
    }
  });

  await page.goto('http://localhost:3002');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== API RESPONSES ===');
  responses.forEach(r => {
    console.log(`${r.status} ${r.url}`);
    if (r.body) {
      console.log(`  Response: ${JSON.stringify(r.body).substring(0, 200)}`);
    }
  });

  expect(responses.length).toBeGreaterThan(0);
  expect(responses.every(r => r.status === 200)).toBe(true);
});
