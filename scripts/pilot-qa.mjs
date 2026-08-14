import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
const errors = [];
async function check(viewport, label) {
  const page = await browser.newPage({ viewport });
  page.on('console', m => { if (m.type() === 'error') errors.push(`${label}: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`${label}: ${e.message}`));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /Start Lecture 01/i }).click();
  await page.getByRole('heading', { name: 'Thinking at Data Scale' }).waitFor();
  const firstCase = page.locator('text=Predict next month').locator('..');
  await firstCase.getByRole('button', { name: 'Supervised', exact: true }).click();
  if (!(await firstCase.getByText(/Training examples pair/).isVisible())) throw new Error(`${label}: task feedback missing`);
  await page.getByRole('slider', { name: 'Velocity' }).fill('90');
  if (!(await page.getByText(/dominant concern is Velocity/).isVisible())) throw new Error(`${label}: Four-V feedback incorrect`);
  await page.getByRole('link', { name: /Continue to Lecture 02/ }).click();
  await page.getByRole('heading', { name: 'From Messy Data to Signal' }).waitFor();
  await page.getByRole('button', { name: 'missing age' }).click();
  await page.getByRole('slider', { name: 'Annual income' }).fill('73000');
  if (!(await page.getByText('0.709').isVisible())) throw new Error(`${label}: min-max result missing`);
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  if (bodyWidth > viewport.width + 1) throw new Error(`${label}: horizontal overflow ${bodyWidth} > ${viewport.width}`);
  await page.screenshot({ path: `.qa-${label}.png`, fullPage: true });
  await page.close();
}
await check({ width: 1280, height: 900 }, 'desktop');
await check({ width: 390, height: 844 }, 'mobile');
await browser.close();
if (errors.length) throw new Error(errors.join('\n'));
console.log('QA PASS: home, both lectures, interactions, navigation, responsive layout, and console errors checked.');


