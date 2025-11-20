# Testing Guide - AI Agent Dashboard

## Overview

This project uses **Microsoft Playwright** for end-to-end testing, including comprehensive accessibility testing with **@axe-core/playwright**.

## Test Suite Structure

### Test Files

```
tests/
├── home.spec.ts              # Home page tests
├── project-detail.spec.ts    # Project detail page tests
├── components.spec.ts        # Component library tests
└── accessibility.spec.ts     # WCAG 2.1 AA accessibility tests
```

### Test Coverage

#### 1. Home Page Tests (`home.spec.ts`)

**Functional Tests:**
- ✅ Page loads and displays main heading
- ✅ New Project button is visible and enabled
- ✅ Modal opens when clicking New Project
- ✅ Empty state displays when no projects exist
- ✅ Form validation (required fields, min length)
- ✅ Project creation flow (full E2E)
- ✅ Modal closes on Cancel/Escape
- ✅ Navigation to project detail
- ✅ Loading state with skeletons
- ✅ Project badges display correct variants

**Accessibility Tests:**
- ✅ No axe violations
- ✅ Keyboard navigation
- ✅ Tab order is logical

**Responsive Tests:**
- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1440px)

#### 2. Project Detail Page Tests (`project-detail.spec.ts`)

**Functional Tests:**
- ✅ Project details display correctly
- ✅ Back navigation works
- ✅ All 10 agents display in sidebar
- ✅ Project stats display
- ✅ Empty states (no agent selected, no messages)
- ✅ Agent selection
- ✅ Message sending (Enter key)
- ✅ Multi-line support (Shift+Enter)
- ✅ Controls disabled during execution
- ✅ Loading state during agent execution

**Accessibility Tests:**
- ✅ No axe violations
- ✅ Keyboard navigation

**Responsive Tests:**
- ✅ Stacked layout on mobile
- ✅ Side-by-side layout on desktop

#### 3. Component Library Tests (`components.spec.ts`)

**Components Tested:**
- Button (variants, sizes, loading, disabled)
- Input (labels, placeholders, validation, errors)
- Textarea (multi-line support)
- Dialog/Modal (open, close, backdrop, focus trap)
- Badge (semantic variants)
- Card (hover effects)
- Toast (display, auto-dismiss, close button)
- Empty State
- Skeleton loaders
- Spinner

#### 4. Accessibility Tests (`accessibility.spec.ts`)

**WCAG 2.1 AA Compliance:**
- ✅ No violations on home page
- ✅ No violations on modal
- ✅ No violations on project detail page
- ✅ Keyboard accessibility
- ✅ Form labels on all inputs
- ✅ Error messages associated with inputs (aria-describedby)
- ✅ Required fields marked (aria-required)
- ✅ Focus visible on interactive elements
- ✅ Color contrast meets AA standards
- ✅ Heading hierarchy is logical
- ✅ Images have alt text
- ✅ Main landmark present
- ✅ Buttons have accessible names
- ✅ Links have accessible names
- ✅ Toast notifications use ARIA live regions
- ✅ Modal focus trap
- ✅ Reduced motion preference respected
- ✅ Touch targets 44x44px minimum
- ✅ Form validation messages
- ✅ Page title is descriptive
- ✅ Loading states announced
- ✅ Error messages announced

## Running Tests

### Prerequisites

```bash
cd dashboard/frontend
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests with UI (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run mobile tests
npm run test:mobile

# View test report
npm run test:report
```

### Single Test File

```bash
npx playwright test tests/home.spec.ts
```

### Single Test

```bash
npx playwright test -g "should create a new project"
```

### Debug Mode

```bash
npx playwright test --debug
```

## Test Configuration

### `playwright.config.ts`

```typescript
{
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  },
}
```

## Test Writing Guidelines

### Best Practices

1. **Use Role-Based Selectors**
   ```typescript
   // Good
   page.getByRole('button', { name: 'Submit' })

   // Avoid
   page.locator('.submit-button')
   ```

2. **Wait for Elements Properly**
   ```typescript
   await expect(page.getByText('Success')).toBeVisible({ timeout: 5000 });
   ```

3. **Test User Flows, Not Implementation**
   ```typescript
   // Good - tests what user does
   await page.getByLabel('Email').fill('user@example.com');
   await page.getByRole('button', { name: 'Login' }).click();

   // Bad - tests implementation details
   await page.locator('#email-input').fill('user@example.com');
   await page.locator('form').evaluate(form => form.submit());
   ```

4. **Group Related Tests**
   ```typescript
   test.describe('Authentication', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/login');
     });

     test('should login successfully', async ({ page }) => {
       // ...
     });
   });
   ```

5. **Use Accessibility Testing**
   ```typescript
   const accessibilityScanResults = await new AxeBuilder({ page })
     .withTags(['wcag2a', 'wcag2aa'])
     .analyze();

   expect(accessibilityScanResults.violations).toEqual([]);
   ```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npm test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Test Data Management

### Database Considerations

Tests create real projects in the database. For production testing:

1. **Use a test database:**
   ```bash
   DATABASE_URL="file:./test.db" npm test
   ```

2. **Clean up after tests:**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Delete created projects
     await api.deleteProject(projectId);
   });
   ```

3. **Use test fixtures:**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await seedTestData();
   });
   ```

## Known Test Considerations

### Backend Dependency

Some tests require the backend API to be running:

```bash
# Terminal 1: Backend
cd dashboard/backend
npm run dev

# Terminal 2: Frontend
cd dashboard/frontend
npm run dev

# Terminal 3: Tests
cd dashboard/frontend
npm test
```

### API Key Required

Tests that execute agents require a valid Anthropic API key in backend `.env`:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Without a valid API key, agent execution tests will fail (expected behavior).

### Timing Considerations

- Agent execution can take 10-30 seconds
- Tests have 30-second timeouts for API calls
- Loading states might be too fast to catch on development machines

## Debugging Failed Tests

### 1. Screenshot on Failure

Screenshots are automatically captured in `test-results/` when tests fail.

### 2. Trace Viewer

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

### 3. Debug Mode

```bash
npx playwright test --debug
```

This opens Playwright Inspector for step-through debugging.

### 4. Headed Mode

```bash
npm run test:headed
```

See the browser while tests run.

## Performance Testing

### Lighthouse Integration (Future)

```typescript
import { playAudit } from 'playwright-lighthouse';

test('should have good performance', async ({ page }) => {
  await page.goto('/');

  await playAudit({
    page,
    thresholds: {
      performance: 90,
      accessibility: 100,
      'best-practices': 90,
      seo: 90,
    },
  });
});
```

## Visual Regression Testing (Future)

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot();
});
```

## Test Metrics

After running tests, view detailed metrics:

```bash
npm run test:report
```

This opens an HTML report showing:
- Test pass/fail rates
- Test duration
- Screenshots of failures
- Trace files for debugging
- Coverage by browser

## Accessibility Testing Tools

### Tools Used

1. **@axe-core/playwright**: Automated accessibility testing
2. **Playwright Built-in**: Role-based selectors, ARIA support
3. **Manual Testing**: Keyboard navigation, screen reader testing

### Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus visible on all elements
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Error messages associated with inputs
- [ ] ARIA live regions for dynamic content
- [ ] Modal focus trap working
- [ ] No keyboard traps
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Touch targets minimum 44x44px
- [ ] Reduced motion respected

## Contributing

When adding new features:

1. Write tests BEFORE implementing the feature (TDD)
2. Test all UI states (loading, error, empty, success)
3. Test keyboard navigation
4. Test mobile viewports
5. Run accessibility tests
6. Ensure tests pass on all browsers

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Axe Core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Accessible Components](https://www.w3.org/WAI/ARIA/apg/)

## Test Coverage Goals

- **Functional**: 80%+ coverage of user flows
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Browser**: All major browsers (Chrome, Firefox, Safari)
- **Mobile**: iOS Safari, Android Chrome
- **Performance**: < 2s initial load, < 100ms interactions
