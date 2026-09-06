import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

async function scanPage(page: Page, testInfo: TestInfo, route: string) {
  await page.locator('main').waitFor({ state: 'visible' });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  await testInfo.attach(`axe-${route.replace(/[^a-z0-9]+/gi, '-') || 'home'}`, {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      failure: node.failureSummary,
    })),
  }));
  expect(summary, `Automatically detectable accessibility violations at ${route}`).toEqual([]);
}

test('the white home page and every lecture pass the automated accessibility scan', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await scanPage(page, testInfo, '/');

  const moduleRoutes = await page.locator('a[href*="#/lectures/"]').evaluateAll((links) => (
    [...new Set(links.map((link) => (link as HTMLAnchorElement).hash))]
  ));

  expect(moduleRoutes.length, 'The course path should expose at least one registered module.').toBeGreaterThan(0);
  for (const route of moduleRoutes) {
    await page.goto(`/${route}`);
    await scanPage(page, testInfo, route);
  }

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.app-shell')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});
