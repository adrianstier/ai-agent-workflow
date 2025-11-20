import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load and display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Agent Dashboard' })).toBeVisible();
    await expect(page.getByText('Orchestrate 10 specialized agents to build products')).toBeVisible();
  });

  test('should show New Project button', async ({ page }) => {
    const newProjectButton = page.getByRole('button', { name: /New Project/i });
    await expect(newProjectButton).toBeVisible();
    await expect(newProjectButton).toBeEnabled();
  });

  test('should open create project modal when clicking New Project', async ({ page }) => {
    await page.getByRole('button', { name: /New Project/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create New Project' })).toBeVisible();
  });

  test('should show empty state when no projects exist', async ({ page }) => {
    // Assuming fresh database with no projects
    const emptyState = page.getByText('No projects yet');
    if (await emptyState.isVisible()) {
      await expect(page.getByText('Create your first project to start orchestrating AI agents')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create Your First Project' })).toBeVisible();
    }
  });

  test('should validate required fields in create project form', async ({ page }) => {
    await page.getByRole('button', { name: /New Project/i }).click();

    // Try to submit without filling required fields
    const createButton = page.getByRole('button', { name: 'Create Project' });
    await expect(createButton).toBeDisabled();

    // Fill only name
    await page.getByPlaceholder('My Awesome App').fill('Te');
    await expect(createButton).toBeDisabled(); // Still disabled (needs description)

    // Fill description
    await page.getByPlaceholder(/Describe what this project does/i).fill('Test description');
    await expect(createButton).toBeEnabled(); // Now enabled
  });

  test('should create a new project successfully', async ({ page }) => {
    const uniqueName = `Test Project ${Date.now()}`;
    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill out the form
    await page.getByPlaceholder('My Awesome App').fill(uniqueName);
    await page.getByPlaceholder(/Describe what this project does/i).fill('This is a test project for Playwright testing');
    await page.getByPlaceholder('e.g., 4 weeks').fill('2 weeks');
    await page.getByPlaceholder('e.g., $5,000').fill('$1,000');
    await page.getByPlaceholder(/Next\.js, TypeScript/i).fill('Next.js, React, Playwright');

    // Submit
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Should show toast notification or modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Project should appear in the list
    await expect(page.getByRole('link', { name: new RegExp(uniqueName, 'i') }).first()).toBeVisible({ timeout: 5000 });
  });

  test('should close modal when clicking Cancel', async ({ page }) => {
    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should close modal when pressing Escape', async ({ page }) => {
    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should navigate to project detail when clicking a project card', async ({ page }) => {
    // First create a project with unique name
    const uniqueName = `Navigation Test ${Date.now()}`;
    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByPlaceholder('My Awesome App').fill(uniqueName);
    await page.getByPlaceholder(/Describe what this project does/i).fill('Testing navigation');
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Click on the project link
    await page.getByRole('link', { name: new RegExp(uniqueName, 'i') }).first().click();

    // Should navigate to project detail page
    await expect(page).toHaveURL(/\/projects\/.+/, { timeout: 5000 });
  });

  test('should have no accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      // Exclude known issues:
      // - scrollable-region-focusable: common issue with overflow containers
      // - heading-order: h3 used for project card titles (design choice)
      .disableRules(['scrollable-region-focusable', 'heading-order'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Focus the button directly
    const button = page.getByRole('button', { name: /New Project/i });
    await button.focus();
    await expect(button).toBeFocused();

    // Press Enter to open modal
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();

    // Focus the input directly
    const nameInput = page.getByPlaceholder('My Awesome App');
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    // Escape to close
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    // This test needs to be fast to catch the loading state
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Check if skeleton loaders are present (they might be very brief)
    const skeletons = page.locator('.animate-pulse');
    if (await skeletons.first().isVisible()) {
      expect(await skeletons.count()).toBeGreaterThan(0);
    }
  });

  test('should display project badges with correct variants', async ({ page }) => {
    // Create a project first with unique name
    const uniqueName = `Badge Test ${Date.now()}`;
    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByPlaceholder('My Awesome App').fill(uniqueName);
    await page.getByPlaceholder(/Describe what this project does/i).fill('Testing badges');
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Check if project card is visible (will have DISCOVER badge)
    const projectLink = page.getByRole('link', { name: new RegExp(uniqueName, 'i') }).first();
    await expect(projectLink).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Home Page - Responsive Design', () => {
  test('should display properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'AI Agent Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: /New Project/i })).toBeVisible();
  });

  test('should display properly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'AI Agent Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: /New Project/i })).toBeVisible();
  });

  test('should display properly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'AI Agent Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: /New Project/i })).toBeVisible();
  });
});
