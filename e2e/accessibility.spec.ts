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

test('the home page and every registered module pass the automated accessibility scan', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await scanPage(page, testInfo, '/');

  const moduleRoutes = await page.locator('a[href*="#/modules/"]').evaluateAll((links) => (
    [...new Set(links.map((link) => (link as HTMLAnchorElement).hash))]
  ));

  expect(moduleRoutes.length, 'The course path should expose at least one registered module.').toBeGreaterThan(0);
  for (const route of moduleRoutes) {
    await page.goto(`/${route}`);
    await scanPage(page, testInfo, route);
  }

  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await scanPage(page, testInfo, '/ dark mode');
});
