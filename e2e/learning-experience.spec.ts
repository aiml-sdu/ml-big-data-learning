import { expect, test, type Page } from '@playwright/test';

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(overflow.document, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.viewport + 1);
  expect(overflow.body, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.viewport + 1);
}

test('the Lecture 1 and 2 course path stays coherent', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Build intuition for machine learning and big data/ })).toBeVisible();
  const homeUrl = page.url();
  await page.getByRole('link', { name: 'Browse modules' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect(page).toHaveURL(homeUrl);

  await page.getByRole('link', { name: /Start learning/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose the learning signal' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('link', { name: /Next module When data changes the architecture/ }).click();
  await expect(page.getByRole('heading', { name: 'When data changes the architecture' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('link', { name: /Previous module Choose the learning signal/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose the learning signal' })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('the first investigation gives feedback and restores stable progress', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/choose-learning-signal');

  await expect(page.getByRole('heading', { name: 'Start with the evidence, not the application' })).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();

  const correctCategories = ['Supervised', 'Unsupervised', 'Reinforcement', 'Self-supervised'];
  for (let index = 0; index < correctCategories.length; index += 1) {
    await page.getByRole('button', { name: correctCategories[index], exact: true }).click();
    await expect(page.getByText('Your choice follows the rule.')).toBeVisible();
    await page.getByRole('button', { name: index === correctCategories.length - 1 ? /Finish activity/ : /Next case/ }).click();
  }

  await expect(page.getByRole('heading', { name: '4 of 4 correct' })).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();

  const radios = page.getByRole('radio');
  await expect(radios).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) await expect(radios.nth(index)).not.toBeChecked();

  await page.getByText('One class for the entire image.').click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/separate class for every pixel/)).toBeVisible();

  await page.getByRole('button', { name: 'Try again' }).click();
  const correctAnswer = page.getByRole('radio', { name: /One discrete class for each pixel/ });
  await correctAnswer.focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/multivariate classification/)).toBeVisible();

  await page.reload();
  await expect(correctAnswer).toBeChecked();
  await expect(page.getByText(/multivariate classification/)).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('heading', { name: '4 of 4 correct' })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('mobile course navigation opens, moves, and closes without hiding the page', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'));
  const errors = collectRuntimeErrors(page);
  await page.goto('/');

  const menu = page.getByRole('button', { name: 'Toggle course navigation' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Course navigation' })
    .getByRole('link', { name: /02 When data changes the architecture/ })
    .click();
  await expect(page.getByRole('heading', { name: 'When data changes the architecture' })).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});