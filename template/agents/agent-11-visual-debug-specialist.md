# Agent 11: Visual Debug Specialist

## Role
Expert in visual debugging using Playwright's screenshot comparison, element inspection, and AI-powered image analysis to identify and fix UI rendering issues.

## Core Responsibilities
- Visual regression detection and analysis
- Element layout and positioning debugging
- CSS/styling issue identification
- Cross-browser visual comparison
- Responsive design debugging
- Animation and transition debugging

## Playwright Visual Debugging Tools

### Advanced Screenshot Comparison

```typescript
// visual-debug/screenshot-comparator.ts
import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';

interface VisualDiff {
  matchPercentage: number;
  diffPixels: number;
  totalPixels: number;
  diffImage: string;
  hotspots: DiffHotspot[];
}

interface DiffHotspot {
  x: number;
  y: number;
  width: number;
  height: number;
  severity: 'minor' | 'moderate' | 'major';
}

async function compareScreenshots(
  baselinePath: string,
  currentPath: string,
  options: {
    threshold?: number;
    includeAA?: boolean;
    diffColor?: [number, number, number];
  } = {}
): Promise<VisualDiff> {
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const current = PNG.sync.read(fs.readFileSync(currentPath));

  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    width,
    height,
    {
      threshold: options.threshold ?? 0.1,
      includeAA: options.includeAA ?? false,
      diffColor: options.diffColor ?? [255, 0, 0]
    }
  );

  const diffPath = `debug-diffs/diff-${Date.now()}.png`;
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  // Analyze diff image to find hotspots
  const hotspots = identifyDiffHotspots(diff, diffPixels);

  return {
    matchPercentage: 100 - (diffPixels / (width * height) * 100),
    diffPixels,
    totalPixels: width * height,
    diffImage: diffPath,
    hotspots
  };
}

function identifyDiffHotspots(
  diffImage: PNG,
  totalDiffPixels: number
): DiffHotspot[] {
  const hotspots: DiffHotspot[] = [];
  const { width, height, data } = diffImage;

  // Scan for clusters of diff pixels
  const visited = new Set<string>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      const isDiff = data[idx] === 255 && data[idx + 1] === 0;

      if (isDiff && !visited.has(`${x},${y}`)) {
        const cluster = floodFillCluster(data, width, height, x, y, visited);
        if (cluster.pixels > 100) { // Minimum cluster size
          hotspots.push({
            x: cluster.minX,
            y: cluster.minY,
            width: cluster.maxX - cluster.minX,
            height: cluster.maxY - cluster.minY,
            severity: cluster.pixels > 1000 ? 'major' :
                     cluster.pixels > 500 ? 'moderate' : 'minor'
          });
        }
      }
    }
  }

  return hotspots.sort((a, b) =>
    (b.width * b.height) - (a.width * a.height)
  );
}
```

### Element Visual Inspection

```typescript
// visual-debug/element-inspector.ts
import { Page, Locator } from '@playwright/test';

interface ElementVisualInfo {
  selector: string;
  boundingBox: BoundingBox;
  computedStyles: Record<string, string>;
  layoutInfo: LayoutInfo;
  visibility: VisibilityInfo;
  screenshot: string;
}

interface LayoutInfo {
  display: string;
  position: string;
  flexInfo?: FlexInfo;
  gridInfo?: GridInfo;
  overflow: string;
  zIndex: string;
}

interface VisibilityInfo {
  isVisible: boolean;
  isInViewport: boolean;
  opacity: number;
  isObscured: boolean;
  obscuredBy?: string;
}

async function inspectElement(
  page: Page,
  selector: string
): Promise<ElementVisualInfo> {
  const element = page.locator(selector);

  // Get bounding box
  const boundingBox = await element.boundingBox();

  // Get computed styles
  const computedStyles = await element.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    const relevantProps = [
      'display', 'position', 'top', 'left', 'right', 'bottom',
      'width', 'height', 'margin', 'padding', 'border',
      'background', 'color', 'font-size', 'font-family',
      'z-index', 'opacity', 'visibility', 'overflow',
      'flex-direction', 'justify-content', 'align-items',
      'grid-template-columns', 'grid-template-rows'
    ];

    const result: Record<string, string> = {};
    relevantProps.forEach(prop => {
      result[prop] = styles.getPropertyValue(prop);
    });
    return result;
  });

  // Get layout information
  const layoutInfo = await element.evaluate((el) => {
    const styles = window.getComputedStyle(el);

    const info: LayoutInfo = {
      display: styles.display,
      position: styles.position,
      overflow: styles.overflow,
      zIndex: styles.zIndex
    };

    if (styles.display.includes('flex')) {
      info.flexInfo = {
        direction: styles.flexDirection,
        wrap: styles.flexWrap,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        gap: styles.gap
      };
    }

    if (styles.display.includes('grid')) {
      info.gridInfo = {
        templateColumns: styles.gridTemplateColumns,
        templateRows: styles.gridTemplateRows,
        gap: styles.gap
      };
    }

    return info;
  });

  // Check visibility
  const visibility = await checkElementVisibility(page, element);

  // Take element screenshot
  const screenshotPath = `debug-elements/${selector.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`;
  await element.screenshot({ path: screenshotPath });

  return {
    selector,
    boundingBox,
    computedStyles,
    layoutInfo,
    visibility,
    screenshot: screenshotPath
  };
}

async function checkElementVisibility(
  page: Page,
  element: Locator
): Promise<VisibilityInfo> {
  return await element.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);

    // Check if in viewport
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );

    // Check if obscured by another element
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const topElement = document.elementFromPoint(centerX, centerY);
    const isObscured = topElement !== el && !el.contains(topElement);

    return {
      isVisible: styles.visibility !== 'hidden' && styles.display !== 'none',
      isInViewport,
      opacity: parseFloat(styles.opacity),
      isObscured,
      obscuredBy: isObscured ? (topElement as HTMLElement)?.className : undefined
    };
  });
}
```

### Visual Regression Test Suite

```typescript
// visual-debug/regression-tests.ts
import { test, expect } from '@playwright/test';

interface VisualTestConfig {
  name: string;
  url: string;
  selector?: string;
  viewports: Viewport[];
  actions?: TestAction[];
  waitFor?: string;
  maskSelectors?: string[];
}

const visualTests: VisualTestConfig[] = [
  {
    name: 'homepage',
    url: '/',
    viewports: [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' }
    ],
    maskSelectors: ['[data-testid="timestamp"]', '.dynamic-content']
  },
  {
    name: 'dashboard',
    url: '/dashboard',
    viewports: [{ width: 1440, height: 900, name: 'desktop' }],
    actions: [
      { type: 'click', selector: '[data-testid="filter-dropdown"]' },
      { type: 'wait', ms: 500 }
    ]
  }
];

test.describe('Visual Regression Tests', () => {
  for (const config of visualTests) {
    for (const viewport of config.viewports) {
      test(`${config.name} - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height
        });

        await page.goto(config.url);

        // Wait for content
        if (config.waitFor) {
          await page.waitForSelector(config.waitFor);
        }

        // Execute actions
        if (config.actions) {
          for (const action of config.actions) {
            if (action.type === 'click') {
              await page.click(action.selector);
            } else if (action.type === 'wait') {
              await page.waitForTimeout(action.ms);
            }
          }
        }

        // Take screenshot with masking
        const screenshot = config.selector
          ? await page.locator(config.selector).screenshot()
          : await page.screenshot({
              fullPage: true,
              mask: config.maskSelectors?.map(s => page.locator(s))
            });

        await expect(screenshot).toMatchSnapshot(
          `${config.name}-${viewport.name}.png`,
          { threshold: 0.1 }
        );
      });
    }
  }
});
```

## AI-Powered Visual Analysis

### Screenshot Analysis with Claude Vision

```typescript
// visual-debug/ai-visual-analyzer.ts
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

interface VisualAnalysis {
  issues: VisualIssue[];
  suggestions: string[];
  accessibilityNotes: string[];
  layoutAnalysis: string;
}

interface VisualIssue {
  type: 'alignment' | 'spacing' | 'color' | 'typography' | 'responsive' | 'overlap';
  severity: 'critical' | 'major' | 'minor';
  location: string;
  description: string;
  suggestedFix: string;
}

async function analyzeScreenshot(
  screenshotPath: string,
  context: string
): Promise<VisualAnalysis> {
  const client = new Anthropic();
  const imageData = fs.readFileSync(screenshotPath).toString('base64');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: imageData
          }
        },
        {
          type: 'text',
          text: `You are a visual debugging expert. Analyze this screenshot for UI issues.

Context: ${context}

Identify and report:

1. **Visual Issues**: Look for:
   - Misaligned elements
   - Inconsistent spacing
   - Color contrast problems
   - Typography issues (truncation, overflow)
   - Overlapping elements
   - Broken layouts

2. **For each issue provide**:
   - Issue type
   - Severity (critical/major/minor)
   - Location in the screenshot
   - Description
   - Suggested CSS/code fix

3. **Accessibility concerns** related to visual presentation

4. **Overall layout analysis**: Is the design following best practices?

Format your response as JSON matching this structure:
{
  "issues": [...],
  "suggestions": [...],
  "accessibilityNotes": [...],
  "layoutAnalysis": "..."
}`
        }
      ]
    }]
  });

  return JSON.parse(response.content[0].text);
}

async function compareTwoScreenshots(
  beforePath: string,
  afterPath: string,
  changeDescription: string
): Promise<string> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: fs.readFileSync(beforePath).toString('base64')
          }
        },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: fs.readFileSync(afterPath).toString('base64')
          }
        },
        {
          type: 'text',
          text: `Compare these two screenshots (before and after).

Change made: ${changeDescription}

Analyze:
1. All visual differences between the two images
2. Whether the changes are intentional or regression bugs
3. Any unintended side effects of the change
4. Impact on user experience

Provide specific pixel locations and element descriptions.`
        }
      ]
    }]
  });

  return response.content[0].text;
}
```

### Design-to-Implementation Comparison

```typescript
// visual-debug/design-comparison.ts
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

interface DesignComparison {
  matchScore: number;
  deviations: Deviation[];
  suggestions: string[];
}

interface Deviation {
  element: string;
  issue: string;
  designValue: string;
  implementationValue: string;
  priority: 'must-fix' | 'should-fix' | 'nice-to-have';
}

async function compareDesignToImplementation(
  designPath: string,
  implementationPath: string
): Promise<DesignComparison> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: fs.readFileSync(designPath).toString('base64')
          }
        },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: fs.readFileSync(implementationPath).toString('base64')
          }
        },
        {
          type: 'text',
          text: `Compare this design mockup (first image) with its implementation (second image).

Provide a detailed analysis:

1. **Match Score** (0-100): How closely does the implementation match the design?

2. **Deviations**: For each difference, provide:
   - Element affected
   - What's different
   - Design specification
   - Current implementation
   - Priority (must-fix/should-fix/nice-to-have)

Focus on:
- Spacing and margins
- Colors and gradients
- Typography (font size, weight, line height)
- Border radius and shadows
- Icon sizes and positions
- Responsive behavior

3. **Suggestions** for improving implementation fidelity

Return as JSON.`
        }
      ]
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

## Cross-Browser Visual Testing

### Browser Matrix Testing

```typescript
// visual-debug/cross-browser.ts
import { chromium, firefox, webkit, Browser } from '@playwright/test';

interface BrowserTestResult {
  browser: string;
  screenshot: string;
  issues: string[];
  renderTime: number;
}

async function testAcrossBrowsers(
  url: string,
  viewport: { width: number; height: number }
): Promise<BrowserTestResult[]> {
  const browsers = [
    { name: 'chromium', launcher: chromium },
    { name: 'firefox', launcher: firefox },
    { name: 'webkit', launcher: webkit }
  ];

  const results: BrowserTestResult[] = [];

  for (const { name, launcher } of browsers) {
    const browser = await launcher.launch();
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    const start = Date.now();
    await page.goto(url, { waitUntil: 'networkidle' });
    const renderTime = Date.now() - start;

    const screenshotPath = `debug-browsers/${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Collect browser-specific issues
    const issues = await page.evaluate(() => {
      const issues: string[] = [];

      // Check for unsupported CSS
      document.querySelectorAll('*').forEach(el => {
        const styles = window.getComputedStyle(el);

        // Check for fallback values indicating unsupported features
        if (styles.display === 'block' &&
            el.getAttribute('style')?.includes('grid')) {
          issues.push(`Grid not supported on ${el.tagName}`);
        }
      });

      return issues;
    });

    results.push({
      browser: name,
      screenshot: screenshotPath,
      issues,
      renderTime
    });

    await browser.close();
  }

  return results;
}

async function compareAcrossBrowsers(
  results: BrowserTestResult[]
): Promise<CrossBrowserAnalysis> {
  // Compare all browser screenshots
  const comparisons: BrowserComparison[] = [];

  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const diff = await compareScreenshots(
        results[i].screenshot,
        results[j].screenshot
      );

      comparisons.push({
        browser1: results[i].browser,
        browser2: results[j].browser,
        matchPercentage: diff.matchPercentage,
        diffImage: diff.diffImage,
        hotspots: diff.hotspots
      });
    }
  }

  return {
    results,
    comparisons,
    overallCompatibility: calculateOverallCompatibility(comparisons)
  };
}
```

## Animation and Transition Debugging

### Animation Inspector

```typescript
// visual-debug/animation-inspector.ts
import { Page } from '@playwright/test';

interface AnimationInfo {
  name: string;
  duration: number;
  timingFunction: string;
  iterations: number;
  direction: string;
  state: 'running' | 'paused' | 'finished';
  progress: number;
}

async function inspectAnimations(page: Page): Promise<AnimationInfo[]> {
  return await page.evaluate(() => {
    const animations = document.getAnimations();

    return animations.map(anim => ({
      name: (anim as CSSAnimation).animationName || 'unnamed',
      duration: anim.effect?.getTiming().duration as number || 0,
      timingFunction: anim.effect?.getTiming().easing || 'linear',
      iterations: anim.effect?.getTiming().iterations || 1,
      direction: anim.effect?.getTiming().direction || 'normal',
      state: anim.playState,
      progress: anim.currentTime
        ? (anim.currentTime / (anim.effect?.getTiming().duration as number || 1))
        : 0
    }));
  });
}

async function captureAnimationFrames(
  page: Page,
  selector: string,
  frameCount: number = 10
): Promise<string[]> {
  const element = page.locator(selector);
  const frames: string[] = [];

  // Get animation duration
  const duration = await element.evaluate((el) => {
    const anim = el.getAnimations()[0];
    return anim?.effect?.getTiming().duration as number || 1000;
  });

  const frameInterval = duration / frameCount;

  for (let i = 0; i <= frameCount; i++) {
    // Seek to frame
    await element.evaluate((el, time) => {
      const anim = el.getAnimations()[0];
      if (anim) {
        anim.pause();
        anim.currentTime = time;
      }
    }, i * frameInterval);

    const framePath = `debug-animations/frame-${i}.png`;
    await element.screenshot({ path: framePath });
    frames.push(framePath);
  }

  return frames;
}
```

### Transition Debugging

```typescript
// visual-debug/transition-debugger.ts
import { Page } from '@playwright/test';

interface TransitionEvent {
  property: string;
  duration: number;
  element: string;
  fromValue: string;
  toValue: string;
  timestamp: number;
}

async function monitorTransitions(
  page: Page,
  selector: string
): Promise<TransitionEvent[]> {
  const events: TransitionEvent[] = [];

  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return;

    const originalStyles = window.getComputedStyle(element);

    element.addEventListener('transitionstart', (e: TransitionEvent) => {
      (window as any).__transitionEvents = (window as any).__transitionEvents || [];
      (window as any).__transitionEvents.push({
        property: e.propertyName,
        element: sel,
        timestamp: Date.now()
      });
    });

    element.addEventListener('transitionend', (e: TransitionEvent) => {
      const events = (window as any).__transitionEvents || [];
      const startEvent = events.find(
        (ev: any) => ev.property === e.propertyName && !ev.duration
      );
      if (startEvent) {
        startEvent.duration = Date.now() - startEvent.timestamp;
        startEvent.toValue = window.getComputedStyle(element)
          .getPropertyValue(e.propertyName);
      }
    });
  }, selector);

  return events;
}
```

## Responsive Design Debugging

### Responsive Breakpoint Tester

```typescript
// visual-debug/responsive-tester.ts
import { Page } from '@playwright/test';

const BREAKPOINTS = [
  { name: 'xs', width: 320, height: 568 },
  { name: 'sm', width: 640, height: 1136 },
  { name: 'md', width: 768, height: 1024 },
  { name: 'lg', width: 1024, height: 768 },
  { name: 'xl', width: 1280, height: 800 },
  { name: '2xl', width: 1536, height: 864 }
];

interface ResponsiveIssue {
  breakpoint: string;
  issue: string;
  element: string;
  screenshot: string;
}

async function testResponsiveDesign(
  page: Page,
  url: string
): Promise<ResponsiveIssue[]> {
  const issues: ResponsiveIssue[] = [];

  for (const breakpoint of BREAKPOINTS) {
    await page.setViewportSize({
      width: breakpoint.width,
      height: breakpoint.height
    });

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // Check for common responsive issues
    const breakpointIssues = await page.evaluate(() => {
      const issues: string[] = [];

      // Check for horizontal overflow
      if (document.body.scrollWidth > window.innerWidth) {
        issues.push('Horizontal overflow detected');
      }

      // Check for text overflow
      document.querySelectorAll('*').forEach(el => {
        const styles = window.getComputedStyle(el);
        if (el.scrollWidth > el.clientWidth &&
            styles.overflow !== 'hidden' &&
            styles.textOverflow !== 'ellipsis') {
          issues.push(`Text overflow in ${el.tagName}.${el.className}`);
        }
      });

      // Check for tiny touch targets
      document.querySelectorAll('button, a, input').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          issues.push(`Touch target too small: ${el.tagName}.${el.className}`);
        }
      });

      return issues;
    });

    for (const issue of breakpointIssues) {
      const screenshotPath = `debug-responsive/${breakpoint.name}-issue-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath });

      issues.push({
        breakpoint: breakpoint.name,
        issue,
        element: '',
        screenshot: screenshotPath
      });
    }
  }

  return issues;
}
```

## Deliverables

### Visual Debug Report Template

```markdown
# Visual Debug Report

## Issue: [Title]
**Severity:** [Critical/Major/Minor]
**Affected Viewports:** [List]

## Visual Evidence

### Current State
![Current](./screenshots/current.png)

### Expected State
![Expected](./screenshots/expected.png)

### Diff Visualization
![Diff](./screenshots/diff.png)

## Analysis

### Issue Details
- **Location:** [Element selector or screen region]
- **Type:** [Alignment/Spacing/Color/Typography/Layout]
- **Root Cause:** [CSS property or code issue]

### Computed Styles
```css
/* Current problematic styles */
.affected-element {
  margin: 10px; /* Should be 16px */
  padding: 8px; /* Correct */
}
```

## Fix Recommendation

### CSS Changes
```css
/* File: src/styles/component.css:42 */
.affected-element {
  margin: 16px; /* Updated from 10px */
}
```

### Additional Fixes
1. [Fix 1]
2. [Fix 2]

## Regression Test

```typescript
test('visual regression - affected component', async ({ page }) => {
  await page.goto('/affected-page');
  await expect(page.locator('.affected-element')).toHaveScreenshot();
});
```
```

## Usage Prompts

### Visual Bug Investigation
```
I have a visual bug where [describe issue].

Please:
1. Capture screenshots at multiple viewports
2. Identify the affected elements
3. Analyze computed styles
4. Compare against any available design specs
5. Provide specific CSS fixes
```

### Cross-Browser Visual Testing
```
Test [URL] across all browsers and:
1. Capture screenshots in Chrome, Firefox, Safari
2. Generate diff images showing inconsistencies
3. Identify browser-specific issues
4. Suggest cross-browser compatible fixes
```

### Responsive Design Audit
```
Audit [component/page] for responsive issues:
1. Test at all standard breakpoints
2. Check for overflow and layout breaks
3. Verify touch target sizes on mobile
4. Ensure text readability at all sizes
5. Generate a comprehensive responsive report
```
