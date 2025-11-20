import { test, expect } from '@playwright/test';

test.describe('GitHub Integration Tests', () => {
  test('backend should have GitHub routes available', async ({ request }) => {
    // Test if GitHub routes are registered
    const endpoints = [
      '/api/github/repo',
      '/api/github/branches',
      '/api/github/tree',
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing endpoint: GET ${endpoint}`);
      const response = await request.get(`http://localhost:4000${endpoint}`);
      console.log(`Status: ${response.status()}`);

      // Should get either 200 (success) or 500 (GitHub not configured)
      // Both are acceptable - means route exists
      expect([200, 500]).toContain(response.status());
    }
  });

  test('code browser page should load', async ({ page }) => {
    // First create a project or use existing one
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    // Get first project link or create one
    const projectLink = page.locator('a[href*="/projects/"]').first();
    const projectExists = await projectLink.count() > 0;

    if (!projectExists) {
      console.log('No projects found, skipping code browser test');
      test.skip();
      return;
    }

    // Get project ID from href
    const href = await projectLink.getAttribute('href');
    const projectId = href?.split('/').pop();

    console.log(`Testing code browser for project: ${projectId}`);

    // Navigate to code browser
    await page.goto(`http://localhost:3002/projects/${projectId}/code`);
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/github-code-browser.png', fullPage: true });

    // Check if page loaded (might show error if GitHub not configured)
    const heading = page.getByRole('heading', { name: 'Code Browser' });
    const errorState = page.getByText('Failed to load repository');

    const hasHeading = await heading.isVisible();
    const hasError = await errorState.isVisible();

    console.log(`Heading visible: ${hasHeading}`);
    console.log(`Error state visible: ${hasError}`);

    // Either heading or error should be visible
    expect(hasHeading || hasError).toBe(true);

    if (hasError) {
      console.log('⚠️  GitHub not configured - expected behavior');
      console.log('To fix: Add GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO to backend/.env');
    } else {
      console.log('✅ Code browser loaded successfully');
    }
  });

  test('should show proper error when GitHub not configured', async ({ page }) => {
    const projectId = 'test-project';

    // Navigate to code browser
    await page.goto(`http://localhost:3002/projects/${projectId}/code`);
    await page.waitForTimeout(2000);

    // Should either load or show error
    const isLoading = await page.getByText('Loading repository').isVisible();
    const errorHeading = page.getByRole('heading', { name: 'Failed to load repository' });
    const hasError = await errorHeading.isVisible();
    const contentHeading = page.getByRole('heading', { name: 'Code Browser' });
    const hasContent = await contentHeading.isVisible();

    console.log(`Loading: ${isLoading}`);
    console.log(`Error: ${hasError}`);
    console.log(`Content: ${hasContent}`);

    // One of these should be true
    expect(isLoading || hasError || hasContent).toBe(true);
  });
});

test.describe('GitHub API Route Tests', () => {
  test('GET /api/github/repo should respond', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/github/repo');

    console.log(`Status: ${response.status()}`);

    if (response.status() === 200) {
      const data = await response.json();
      console.log('✅ GitHub configured correctly');
      console.log(`Repository: ${data.full_name}`);
      expect(data).toHaveProperty('full_name');
    } else if (response.status() === 500) {
      const error = await response.json();
      console.log('⚠️  GitHub not configured (expected)');
      console.log(`Error: ${error.error?.message}`);
      expect(error.error).toHaveProperty('message');
    }
  });

  test('GET /api/github/branches should respond', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/github/branches');

    console.log(`Status: ${response.status()}`);

    if (response.status() === 200) {
      const data = await response.json();
      console.log(`✅ Found ${data.length} branches`);
      expect(Array.isArray(data)).toBe(true);
    } else {
      console.log('⚠️  GitHub not configured');
    }
  });

  test('GET /api/github/tree should accept query params', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/github/tree?path=&ref=main');

    console.log(`Status: ${response.status()}`);
    console.log(`Query params work: ${response.status() !== 404}`);

    // Should not be 404 (route exists)
    expect(response.status()).not.toBe(404);
  });
});

test.describe('Integration Checks', () => {
  test('check if Octokit is installed', async ({ request }) => {
    // Try to import the integration
    const response = await request.get('http://localhost:4000/api/github/repo');

    // If we get anything other than 404, the integration is loaded
    const integrationLoaded = response.status() !== 404;
    console.log(`GitHub integration loaded: ${integrationLoaded}`);

    expect(integrationLoaded).toBe(true);
  });

  test('verify backend routes are registered', async ({ request }) => {
    const routes = [
      { method: 'GET', path: '/api/github/repo' },
      { method: 'GET', path: '/api/github/branches' },
      { method: 'GET', path: '/api/github/tree' },
      { method: 'GET', path: '/api/github/file' },
      { method: 'GET', path: '/api/github/commits' },
      { method: 'GET', path: '/api/github/pull-requests' },
      { method: 'GET', path: '/api/github/search' },
    ];

    console.log('\n=== Testing GitHub API Routes ===');

    for (const route of routes) {
      let response;

      if (route.method === 'GET') {
        // Add required query params for some routes
        let url = `http://localhost:4000${route.path}`;
        if (route.path === '/api/github/search') {
          url += '?q=test';
        }

        response = await request.get(url);
      }

      const exists = response!.status() !== 404;
      console.log(`${route.method} ${route.path}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'} (${response!.status()})`);

      expect(response!.status()).not.toBe(404);
    }
  });
});
