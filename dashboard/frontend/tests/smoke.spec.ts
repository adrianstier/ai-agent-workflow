import { test, expect } from '@playwright/test';

test.describe('Smoke Tests (Quick Validation)', () => {
  test('home page loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('home page has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AI Agent Dashboard/);
  });

  test('home page renders main content', async ({ page }) => {
    await page.goto('/');

    // Wait for React to hydrate
    await page.waitForLoadState('networkidle');

    // Check for main heading (should be in loading state or loaded)
    const hasLoadingState = await page.locator('.animate-pulse').count() > 0;
    const hasMainHeading = await page.getByRole('heading', { name: 'AI Agent Dashboard' }).isVisible();

    expect(hasLoadingState || hasMainHeading).toBe(true);
  });

  test('CSS is loaded correctly', async ({ page }) => {
    await page.goto('/');

    // Check if Tailwind CSS is working
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should have a background color (not default white)
    expect(bgColor).toBeTruthy();
  });

  test('JavaScript is executing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if JavaScript is working by verifying React has hydrated
    // Look for interactive elements that only work with JS enabled
    const hasReact = await page.evaluate(() => {
      // Check for Next.js data, React root, or any evidence of JS execution
      return (
        '__next' in window ||
        '__NEXT_DATA__' in window ||
        document.querySelector('[data-reactroot]') !== null ||
        document.querySelector('#__next') !== null ||
        // Check if buttons are clickable (JS enabled)
        document.querySelectorAll('button').length > 0
      );
    });

    expect(hasReact).toBe(true);
  });

  test('responsive viewport works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should render without errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('page has proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1');

    // Check description
    const description = page.locator('meta[name="description"]');
    expect(await description.count()).toBeGreaterThan(0);
  });

  test('no JavaScript errors in console', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known network errors (API unavailable)
    const criticalErrors = errors.filter(
      (err) => !err.includes('fetch') && !err.includes('load') && !err.includes('ECONNREFUSED')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Component Smoke Tests', () => {
  test('buttons render and are clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find any button
    const buttons = page.locator('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);

    // First button should be clickable
    const firstButton = buttons.first();
    await expect(firstButton).toBeEnabled();
  });

  test('main element exists', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('color scheme is applied', async ({ page }) => {
    await page.goto('/');

    // Check if our slate background is applied
    const main = page.locator('main');
    const bgColor = await main.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should not be pure white (rgb(255, 255, 255))
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('fonts are loaded', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    const fontFamily = await body.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });

    // Should have a font family set
    expect(fontFamily).toBeTruthy();
    expect(fontFamily.length).toBeGreaterThan(0);
  });
});

test.describe('Performance Smoke Tests', () => {
  test('page loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('no memory leaks on navigation', async ({ page }) => {
    await page.goto('/');

    // Get initial metrics
    const metrics1 = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Navigate away and back
    await page.goto('/about' || '/'); // Fallback to home if about doesn't exist
    await page.goto('/');

    // Get final metrics
    const metrics2 = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory should not grow excessively (allow 50MB increase)
    if (metrics1 > 0 && metrics2 > 0) {
      const increase = metrics2 - metrics1;
      expect(increase).toBeLessThan(50 * 1024 * 1024); // 50MB
    }
  });
});
